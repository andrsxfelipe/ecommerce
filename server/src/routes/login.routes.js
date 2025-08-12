import { Router } from 'express';
import connection from '../config/db.js'

const router = Router();

router.post('/', (req, res) => {
    const { username, password } = req.body;
    const sql = `
    SELECT * FROM login WHERE username = ? AND password = ?
    `;
    connection.query(sql, [username, password], (err,result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0){
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
            
        }
        res.json(result[0]);
    });
});

export default router;