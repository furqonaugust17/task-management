import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/error.handler.js";
import RouteUser from "./routes/user.routes.js";
// import swagger
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/users", RouteUser);

app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('user API is Ready!');
});

export default app;
