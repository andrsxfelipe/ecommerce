# Insertar CSV en MySQL con Node.js (Versión Mejorada con Promesas)

## Conversación y solución

### 1. Código original del usuario
El usuario tenía este código para leer un CSV e insertarlo en MySQL usando callbacks y un contador `pending`:

```js
import fs from 'fs';
import csv from 'csv-parser';
import mysql from 'mysql2';

export function insertRows() {
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'Andrsxfelipe',
        password: 'idQ6kwx+',
        database: 'SR_Database1'
    });
    db.connect((error) => {
        if (error) throw error;
        console.log('Conectado exitosamente a la db');

        let pending = 0;
        fs.createReadStream('data_import.csv')
            .pipe(csv())
            .on('data', (row) => {
                pending++;
                db.query('SELECT 1 FROM sr_costumers WHERE phone = ?', [row.phone], (err, results) => {
                    if (err) throw err;
                    if (results.length == 0) {
                        db.query('INSERT INTO sr_costumers (phone, name, address, status, note, city, main_language) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [row.phone, row.name, row.address, row.status, row.note, row.city, row.main_language],
                            (error) => {
                                if (error) throw error;
                                console.log('Fila insertada');
                                console.log(row);
                                pending--;
                                if (pending === 0) {
                                    console.log('Todos los registros insertados.');
                                    db.end();
                                }
                            }
                        );
                    } else {
                        console.log('Registro duplicado, no se inserta:', row.phone);
                        pending--;
                        if (pending === 0) {
                            console.log('Todos los registros insertados.');
                            db.end();
                        }
                    }
                })
            })
            .on('end', () => {
                console.log('CSV único procesado.');
            });
    });
}


Problema: el contador pending funciona pero no es muy elegante ni escalable.

2. Recomendación: Uso de mysql2/promise con async/await
La solución más limpia y profesional es usar promesas con async/await para evitar callbacks y contadores manuales.

Código reescrito:

import fs from 'fs';
import csv from 'csv-parser';
import mysql from 'mysql2/promise';

export async function insertRows() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'Andrsxfelipe',
        password: 'idQ6kwx+',
        database: 'SR_Database1'
    });

    console.log('Conectado exitosamente a la db');

    // Leer CSV en memoria
    const rows = await new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream('data_import.csv')
            .pipe(csv())
            .on('data', (row) => data.push(row))
            .on('end', () => resolve(data))
            .on('error', reject);
    });

    console.log(`Archivo CSV leído con ${rows.length} registros`);

    // Insertar registros secuencialmente
    for (const row of rows) {
        try {
            const [exists] = await db.query(
                'SELECT 1 FROM sr_costumers WHERE phone = ?',
                [row.phone]
            );

            if (exists.length === 0) {
                await db.query(
                    `INSERT INTO sr_costumers (phone, name, address, status, note, city, main_language)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [row.phone, row.name, row.address, row.status, row.note, row.city, row.main_language]
                );
                console.log(`Fila insertada: ${row.phone}`);
            } else {
                console.log(`Registro duplicado, no se inserta: ${row.phone}`);
            }
        } catch (err) {
            console.error(`Error al procesar fila ${row.phone}:`, err.message);
        }
    }

    console.log('Todos los registros procesados.');
    await db.end();
}


3. Añadir operaciones después de las inserciones
Con async/await, se pueden encadenar operaciones posteriores garantizando que las inserciones hayan terminado.

Ejemplo: actualizar una columna y crear otra tabla después de insertar:

export async function insertRows() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'Andrsxfelipe',
        password: 'idQ6kwx+',
        database: 'SR_Database1'
    });

    console.log('Conectado exitosamente a la db');

    const rows = await new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream('data_import.csv')
            .pipe(csv())
            .on('data', (row) => data.push(row))
            .on('end', () => resolve(data))
            .on('error', reject);
    });

    for (const row of rows) {
        try {
            const [exists] = await db.query(
                'SELECT 1 FROM sr_costumers WHERE phone = ?',
                [row.phone]
            );

            if (exists.length === 0) {
                await db.query(
                    `INSERT INTO sr_costumers (phone, name, address, status, note, city, main_language)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [row.phone, row.name, row.address, row.status, row.note, row.city, row.main_language]
                );
            }
        } catch (err) {
            console.error(`Error al procesar fila ${row.phone}:`, err.message);
        }
    }

    console.log('✅ Inserciones completadas.');

    try {
        await db.query(
            'UPDATE sr_costumers SET status = 1 WHERE city = ?',
            ['Bogotá']
        );
        console.log('Columna status actualizada.');

        await db.query(`
            CREATE TABLE IF NOT EXISTS sr_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_phone VARCHAR(20),
                order_date DATE,
                amount DECIMAL(10,2),
                FOREIGN KEY (customer_phone) REFERENCES sr_costumers(phone)
            )
        `);
        console.log('Tabla sr_orders creada o ya existente.');
    } catch (err) {
        console.error('Error en operaciones posteriores:', err.message);
    }

    await db.end();
    console.log('Conexión cerrada.');
}


Para verificar si una tabla está normalizada (en el sentido de las primeras formas normales clásicas: 1FN, 2FN, 3FN), puedes guiarte con una lista de preguntas que funcionen como un checklist.

Aquí te las ordeno por nivel de normalización:

Preguntas para 1FN (Primera Forma Normal)
¿Cada celda de la tabla contiene un solo valor atómico (nada de listas, valores separados por comas o campos multivaluados)?

¿No existen columnas repetidas para el mismo tipo de dato? (ejemplo: telefono1, telefono2, telefono3 → eso rompe 1FN)

¿Todas las filas tienen la misma estructura y número de columnas?

¿Cada fila es única y se puede identificar con una clave primaria?

Preguntas para 2FN (Segunda Forma Normal)
(Aplica solo si la clave primaria es compuesta, es decir, de varias columnas)

¿Cada columna depende de toda la clave primaria y no solo de una parte?
(Ejemplo de error: una tabla con clave compuesta (id_pedido, id_producto) y una columna nombre_cliente que solo depende de id_pedido → violación de 2FN)

¿No hay datos que podrían moverse a otra tabla porque no dependen de toda la clave?

Preguntas para 3FN (Tercera Forma Normal)
¿Cada columna depende únicamente de la clave primaria y no de otras columnas no clave?
(Ejemplo de error: tener codigo_postal y ciudad, y ciudad depende de codigo_postal → mejor poner ciudad en otra tabla relacionada)

¿No existen dependencias transitivas?
(clave → columna A → columna B)

Extra: Boyce–Codd (BCNF)
Para cada dependencia funcional, ¿el lado izquierdo es una clave candidata?
(Evita anomalías si hay más de una clave única en la tabla)

💡 Tip práctico:
Si al responder alguna de estas preguntas la respuesta es “No”, probablemente tu tabla necesita refactorizarse o dividirse en más tablas relacionadas con claves foráneas.

