import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';

import cors from 'cors';

import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import db from './config/databaseConfig.js';
import sequelizeSync from './config/sequelizeSyncConfig.js';

import userRouter from './routes/userRoutes.js';
import taxRouter from './routes/taxRoutes.js';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config();

db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch((err) => console.log(`Error: ${err}`));

sequelizeSync();

const app = express();

app.use(express.json());

app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Define the routes here
app.get('/something', (req, res) => {
  res.sendStatus(200);
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/taxes', taxRouter);

//not available routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
