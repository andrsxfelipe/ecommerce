const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const mysql = require('mysql2/promise');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Configura conexión MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'tu_usuario',
  password: 'tu_contraseña',
  database: 'tu_base_de_datos',
});

// Ruta para subir el archivo
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Leer archivo Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Insertar datos en la tabla
    const conn = await pool.getConnection();

    // Ejemplo asumiendo estructura similar a tu tabla
    for (const row of data) {
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
          row.PrecioUnit,
          row.Cantidad,
          row.TotalPedido,
          row.DirecciónEnvio,
          row.Ciudad,
          row.EstadoEnvio,
        ]
      );
    }

    conn.release();

    res.json({ message: 'Archivo subido e insertado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al procesar archivo' });
  }
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
