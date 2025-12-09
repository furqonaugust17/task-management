import express from "express";
import { 
    register,
    getAlluser, 
    getUserById, 
    getUserByEmails, 
    updateUSers, 
    hardDeleteController, 
    softDeleteController,
    loginController,
    getProfile,
    changePassword
} from "../controller/user.controller.js";
import { authenticateToken, verifyOwnership } from "../middlewares/auth.middleware.js";

const RouteUser = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API untuk mengelola data user
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registrasi user baru
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nama lengkap user
 *               email:
 *                 type: string
 *                 description: Email user
 *               password:
 *                 type: string
 *                 description: Password user
 *     responses:
 *       200:
 *         description: User berhasil dibuat
 *       400:
 *         description: Data tidak valid
 */
RouteUser.post("/register", register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Email atau password salah
 */
RouteUser.post("/login", loginController);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Ambil profil user yang sedang login
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data profil user
 *       401:
 *         description: Token tidak valid
 */
RouteUser.get("/profile", authenticateToken, getProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Ambil semua data user (Protected)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua user
 *       401:
 *         description: Token tidak valid
 */
RouteUser.get("/", authenticateToken, getAlluser);

/**
 * @swagger
 * /users/email:
 *   get:
 *     summary: Ambil user berdasarkan email (Protected)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email user
 *     responses:
 *       200:
 *         description: Data user ditemukan
 *       401:
 *         description: Token tidak valid
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.get("/email", authenticateToken, getUserByEmails);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Ambil user berdasarkan ID (Protected)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
 *     responses:
 *       200:
 *         description: Data user berhasil diambil
 *       401:
 *         description: Token tidak valid
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.get("/:id", authenticateToken, getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update data user (Hanya user sendiri)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data user berhasil diperbarui
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: Access denied
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.put("/:id", authenticateToken, verifyOwnership, updateUSers);

/**
 * @swagger
 * /users/change-password/{id}:
 *   put:
 *     summary: Ganti password user (Hanya user sendiri)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 *       401:
 *         description: Token tidak valid atau password lama salah
 *       403:
 *         description: Access denied
 */
RouteUser.put("/change-password/:id", authenticateToken, verifyOwnership, changePassword);

/**
 * @swagger
 * /users/hard/{id}:
 *   delete:
 *     summary: Hapus user secara permanen (Protected)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *       401:
 *         description: Token tidak valid
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.delete("/hard/:id", authenticateToken, verifyOwnership, hardDeleteController);

/**
 * @swagger
 * /users/soft/{id}:
 *   delete:
 *     summary: Hapus user secara soft delete (Protected)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID user
 *     responses:
 *       200:
 *         description: User berhasil di-soft delete
 *       401:
 *         description: Token tidak valid
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.delete("/soft/:id", authenticateToken, verifyOwnership, softDeleteController);

export default RouteUser;