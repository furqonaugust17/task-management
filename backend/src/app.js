import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler.js";
import RouteUser from "./routes/userRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/users", RouteUser);

app.use(errorHandler);

export default app;
