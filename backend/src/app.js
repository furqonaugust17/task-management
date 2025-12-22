import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import RouteUser from "./routes/userRoutes.js";

const app = express();
app.use(express.json());

app.use("/api/users", RouteUser);

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
});

app.use(errorHandler);

export default app;
