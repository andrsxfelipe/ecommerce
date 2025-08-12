const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');

const app = express();
const upload = multer({ dest: 'uploads/' });

const pool = mysql.createPool({
  host: 'localhost',
  user: 'tu_usuario',
  password: 'tu_contraseña',
  database: 'tu_base_de_datos',
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        const conn = await pool.getConnection();

        try {
          for (const row of results) {
            await conn.query(
              `INSERT INTO pedidos
                (PedidoID, FechaPedido, ClienteNombre, ClienteCorreo, ClienteTel, ProductoNombre, Categoría, PrecioUnit, Cantidad, TotalPedido, DirecciónEnvio, Ciudad, EstadoEnvio)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                row.PedidoID,
                row.FechaPedido,
                row.ClienteNombre,
                row.ClienteCorreo,
                row.ClienteTel,
                row.ProductoNombre,
                row.Categoría,
                parseFloat(row.PrecioUnit),
                parseInt(row.Cantidad),
                parseFloat(row.TotalPedido),
                row.DirecciónEnvio,
                row.Ciudad,
                row.EstadoEnvio,
              ]
            );
          }

          conn.release();
          // Borra archivo luego de procesar
          fs.unlinkSync(filePath);

          res.json({ message: 'Archivo CSV subido e insertado correctamente' });
        } catch (dbErr) {
          conn.release();
          fs.unlinkSync(filePath);
          console.error(dbErr);
          res.status(500).json({ message: 'Error al insertar datos en la base' });
        }
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al procesar el archivo CSV' });
  }
});

app.listen(3000, () => console.log('Servidor escuchando en puerto 3000'));
