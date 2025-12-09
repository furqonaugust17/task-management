import jwt from "jsonwebtoken";
import Prisma from "../config/database.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware untuk verifikasi token JWT
export const authenticateToken = async (req, res, next) => {
    try {
        // Ambil token dari header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Token tidak ditemukan."
            });
        }

        // Verifikasi token
        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        success: false,
                        message: "Token sudah kadaluarsa. Silakan login kembali."
                    });
                }
                return res.status(403).json({
                    success: false,
                    message: "Token tidak valid."
                });
            }

            // Cek apakah user masih ada dan aktif
            try {
                const user = await Prisma.user.findUnique({
                    where: { id: decoded.id },
                    select: { 
                        id: true, 
                        email: true, 
                        name: true, 
                        role: true,
                        isActive: true,
                        deletedAt: true
                    }
                });

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "User tidak ditemukan."
                    });
                }

                if (!user.isActive) {
                    return res.status(403).json({
                        success: false,
                        message: "Akun Anda telah dinonaktifkan. Silakan hubungi administrator."
                    });
                }

                if (user.deletedAt) {
                    return res.status(403).json({
                        success: false,
                        message: "Akun Anda telah dihapus. Silakan hubungi administrator."
                    });
                }

                // Simpan data user dari token ke request object
                req.user = user;
                next();
            } catch (dbError) {
                console.error("Error checking user:", dbError);
                return res.status(500).json({
                    success: false,
                    message: "Terjadi kesalahan saat verifikasi user."
                });
            }
        });
    } catch (error) {
        console.error("Error authenticate token:", error.message);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat verifikasi token.",
            error: error.message
        });
    }
};

// Middleware untuk verifikasi role/permission
export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User tidak terautentikasi."
            });
        }

        // Jika ingin menggunakan role-based access control
        if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Anda tidak memiliki permission untuk mengakses resource ini."
            });
        }

        next();
    };
};

// Middleware untuk verifikasi ownership (user hanya bisa akses data mereka sendiri)
export const verifyOwnership = (req, res, next) => {
    try {
        const userId = req.params.id;
        const authenticatedUserId = req.user.id;

        // Admin bisa akses semua data
        if (req.user.role === 'admin') {
            return next();
        }

        if (userId !== authenticatedUserId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Anda hanya bisa mengakses data Anda sendiri."
            });
        }

        next();
    } catch (error) {
        console.error("Error verify ownership:", error.message);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat verifikasi ownership.",
            error: error.message
        });
    }
};

// Middleware untuk mencegah self-deletion
export const preventSelfDeletion = (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const authenticatedUserId = req.user.id;

        if (targetUserId === authenticatedUserId) {
            return res.status(400).json({
                success: false,
                message: "Anda tidak dapat menghapus akun Anda sendiri melalui endpoint ini."
            });
        }

        next();
    } catch (error) {
        console.error("Error prevent self deletion:", error.message);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan.",
            error: error.message
        });
    }
};