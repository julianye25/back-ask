import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { connectDB } from './config/db';

import authRoutes from './routes/authRoutes';
dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin:
      'https://react-academy-git-develop-julian-andres-yepes-gomezs-projects.vercel.app/', // Cambia al puerto de tu frontend si es diferente
    credentials: false, // Si usas cookies o autenticación basada en sesión
  }),
);

// logging middleware
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

export default app;
