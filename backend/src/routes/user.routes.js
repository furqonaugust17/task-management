import express from "express";
import { 
    register,
    getAllUsers, 
    getUserById, 
    getUserByEmail, 
    updateUsers, 
    hardDeleteController, 
    softDeleteController,
    loginController,
    getProfile,
    changePassword,
    getUserStatsController,
    restoreUserController,
    searchUsersController,
    toggleUserStatusController,
    validateTokenController,
    refreshTokenController
} from "../controller/user.controller.js";
import { 
    authenticateToken, 
    verifyOwnership, 
    authorizeRole,
    preventSelfDeletion 
} from "../middlewares/auth.middleware.js";
import {
    validateRegister,
    validateLogin,
    validateUpdateUser,
    validateChangePassword,
    validateGetUserById,
    validateGetUserByEmail,
    validateDeleteUser,
    sanitizeInput
} from "../middlewares/validation.middleware.js";
import {
    authLimiter,
    registerLimiter,
    crudLimiter,
    sensitiveLimiter,
    profileLimiter
} from "../config/rate.limiter.js";
import { sensitiveLogger } from "../middlewares/logger.middleware.js";

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

// ============ PUBLIC ROUTES (TIDAK PERLU TOKEN) ============

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registrasi user baru (Public - Siapa saja bisa register)
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
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: Email user
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 description: Password minimal 6 karakter dengan huruf besar, kecil, dan angka
 *                 example: Password123
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 *       400:
 *         description: Data tidak valid
 *       429:
 *         description: Terlalu banyak request
 */
RouteUser.post("/register", registerLimiter, sanitizeInput, validateRegister, register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user (Public)
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
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Email atau password salah
 *       429:
 *         description: Terlalu banyak percobaan login
 */
RouteUser.post("/login", authLimiter, sanitizeInput, validateLogin, loginController);

/**
 * @swagger
 * /users/validate-token:
 *   post:
 *     summary: Validasi token JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token valid
 *       401:
 *         description: Token tidak valid
 */
RouteUser.post("/validate-token", crudLimiter, validateTokenController);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token berhasil di-refresh
 *       401:
 *         description: Token tidak valid
 */
RouteUser.post("/refresh-token", crudLimiter, refreshTokenController);

// ============ PROTECTED ROUTES (PERLU TOKEN) ============

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
RouteUser.get("/profile", profileLimiter, authenticateToken, getProfile);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Cari user berdasarkan nama atau email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         description: Hasil pencarian user
 */
RouteUser.get("/search", crudLimiter, authenticateToken, searchUsersController);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Ambil semua data user dengan pagination
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Halaman (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Jumlah data per halaman (default 10)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter berdasarkan role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status aktif
 *     responses:
 *       200:
 *         description: Daftar semua user
 *       401:
 *         description: Token tidak valid
 */
RouteUser.get("/", crudLimiter, authenticateToken, getAllUsers);

/**
 * @swagger
 * /users/email:
 *   get:
 *     summary: Ambil user berdasarkan email
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
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.get("/email", crudLimiter, authenticateToken, validateGetUserByEmail, getUserByEmail);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Ambil user berdasarkan ID
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
 *       404:
 *         description: User tidak ditemukan
 */
RouteUser.get("/:id", crudLimiter, authenticateToken, validateGetUserById, getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update data user (Hanya user sendiri atau admin)
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
 *       403:
 *         description: Access denied
 */
RouteUser.put("/:id", crudLimiter, authenticateToken, verifyOwnership, sanitizeInput, validateUpdateUser, updateUsers);

/**
 * @swagger
 * /users/change-password/{id}:
 *   put:
 *     summary: Ganti password user (Hanya user sendiri atau admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 */
RouteUser.put(
    "/change-password/:id", 
    sensitiveLimiter, 
    authenticateToken, 
    verifyOwnership, 
    sensitiveLogger('CHANGE_PASSWORD'),
    validateChangePassword, 
    changePassword
);

/**
 * @swagger
 * /users/hard/{id}:
 *   delete:
 *     summary: Hapus user secara permanen (Hanya user sendiri atau admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 */
RouteUser.delete(
    "/hard/:id", 
    sensitiveLimiter, 
    authenticateToken, 
    verifyOwnership,
    preventSelfDeletion,
    sensitiveLogger('HARD_DELETE'),
    validateDeleteUser, 
    hardDeleteController
);

/**
 * @swagger
 * /users/soft/{id}:
 *   delete:
 *     summary: Hapus user secara soft delete (Hanya user sendiri atau admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User berhasil di-soft delete
 */
RouteUser.delete(
    "/soft/:id", 
    sensitiveLimiter, 
    authenticateToken, 
    verifyOwnership,
    preventSelfDeletion,
    sensitiveLogger('SOFT_DELETE'),
    validateDeleteUser, 
    softDeleteController
);

// ============ ADMIN ONLY ROUTES ============

/**
 * @swagger
 * /users/admin/stats:
 *   get:
 *     summary: Ambil statistik user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik user
 *       403:
 *         description: Access denied
 */
RouteUser.get("/admin/stats", crudLimiter, authenticateToken, authorizeRole('admin'), getUserStatsController);

/**
 * @swagger
 * /users/admin/restore/{id}:
 *   put:
 *     summary: Restore soft deleted user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User berhasil di-restore
 */
RouteUser.put(
    "/admin/restore/:id", 
    sensitiveLimiter, 
    authenticateToken, 
    authorizeRole('admin'),
    sensitiveLogger('RESTORE_USER'),
    validateGetUserById, 
    restoreUserController
);

/**
 * @swagger
 * /users/admin/toggle-status/{id}:
 *   put:
 *     summary: Toggle status user (activate/deactivate) - Admin only
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status user berhasil diubah
 */
RouteUser.put(
    "/admin/toggle-status/:id", 
    sensitiveLimiter, 
    authenticateToken, 
    authorizeRole('admin'),
    sensitiveLogger('TOGGLE_STATUS'),
    validateGetUserById, 
    toggleUserStatusController
);

export default RouteUser;