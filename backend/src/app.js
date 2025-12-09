import express from "express";
import dotenv from "dotenv";
import { authenticateToken, authorizeRole, verifyOwnership } from "./middlewares/auth.middleware.js";
import RouteUser from "./routes/user.routes.js";
// import swagger
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

dotenv.config();

const app = express();
app.use(express.json());

// Swagger docs
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Proteksi semua route user dengan JWT
app.use("/api/users", authenticateToken, RouteUser);

// Contoh route dengan role-based access control
app.get("/api/admin", authenticateToken, authorizeRole("admin"), (req, res) => {
  res.json({ success: true, message: "Halo Admin!" });
});

// Contoh route dengan ownership check
app.get("/api/users/:id", authenticateToken, verifyOwnership, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("User API is Ready!");
});

export default app;