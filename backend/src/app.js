
import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import RouteUser from "./routes/userRoutes.js";
import cors from 'cors';
import taskRoutes from './routes/task.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", RouteUser);
app.use('/api/tasks', taskRoutes);

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
});

app.use(errorHandler);

export default app;