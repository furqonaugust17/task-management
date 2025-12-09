import express from "express";
import { 
    register,
    getAlluser, 
    getUserById, 
    getUserByEmails, 
    updateUSers, 
    hardDeleteController, 
    softDeleteController,
    loginController
} from "../controller/user.controller.js";

const RouteUser = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API untuk mengelola data user
 */

/**
 * @swagger
 * /api/users/register:
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
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email user
 *               password:
 *                 type: string
 *                 description: Password user
 *               nama_lengkap:
 *                 type: string
 *                 description: Nama lengkap user
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 *       400:
 *         description: Data tidak valid
 */
RouteUser.post("/register", register);

/**
 * @swagger
 * /api/users/login:
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
 * /api/users:
 *   get:
 *     summary: Ambil semua data user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Daftar semua user
 */
RouteUser.get("/", getAlluser);

/**
 * @swagger
 * /api/users/email:
 *   get:
 *     summary: Ambil user berdasarkan email
 *     tags: [Users]
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
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.get("/email", getUserByEmails);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Ambil user berdasarkan ID
 *     tags: [Users]
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
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.get("/:id", getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update data user
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *               nama_lengkap:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data user berhasil diperbarui
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.put("/:id", updateUSers);

/**
 * @swagger
 * /api/users/hard/{id}:
 *   delete:
 *     summary: Hapus user secara permanen
 *     tags: [Users]
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
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.delete("/hard/:id", hardDeleteController);

/**
 * @swagger
 * /api/users/soft/{id}:
 *   delete:
 *     summary: Hapus user secara soft delete
 *     tags: [Users]
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
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.delete("/soft/:id", softDeleteController);

export default RouteUser;
