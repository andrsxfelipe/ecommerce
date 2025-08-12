import express from 'express';
import cors from 'cors';
import loginRoutes from './routes/login.routes.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use('/login', loginRoutes);

export default app;