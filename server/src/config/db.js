import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'idQ6kwx+',
    database: 'ecommerce',
    multipleStatements: true
})

connection.connect(err => {
    if (err) {
        console.error('Error al conectarse a Mysql: ', err.message);
    } else {
        console.log('Conexión exitosa')
    }
});

export default connection;