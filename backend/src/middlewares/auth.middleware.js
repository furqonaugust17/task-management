import jwt from "jsonwebtoken";
import Prisma from "../config/database.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Custom error untuk autentikasi
class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AuthError';
  }
}

// Middleware untuk verifikasi token JWT
export const authenticateToken = async (req, res, next) => {
    try {
        // Ambil token dari header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Token tidak ditemukan.",
                statusCode: 401
            });
        }

        // Verifikasi token
        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        success: false,
                        message: "Token sudah kadaluarsa. Silakan login kembali.",
                        statusCode: 401,
                        tokenExpired: true
                    });
                }
                if (err.name === 'JsonWebTokenError') {
                    return res.status(401).json({
                        success: false,
                        message: "Token tidak valid.",
                        statusCode: 401
                    });
                }
                if (err.name === 'NotBeforeError') {
                    return res.status(401).json({
                        success: false,
                        message: "Token belum aktif.",
                        statusCode: 401
                    });
                }
                return res.status(401).json({
                    success: false,
                    message: "Token error.",
                    statusCode: 401
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
                        message: "User tidak ditemukan.",
                        statusCode: 404
                    });
                }

                if (!user.isActive) {
                    return res.status(403).json({
                        success: false,
                        message: "Akun Anda telah dinonaktifkan. Silakan hubungi administrator.",
                        statusCode: 403
                    });
                }

                if (user.deletedAt) {
                    return res.status(403).json({
                        success: false,
                        message: "Akun Anda telah dihapus. Silakan hubungi administrator.",
                        statusCode: 403
                    });
                }

                // Simpan data user dari token ke request object
                req.user = user;
                next();
            } catch (dbError) {
                console.error("Error checking user in authenticateToken:", dbError);
                return res.status(500).json({
                    success: false,
                    message: "Terjadi kesalahan saat verifikasi user.",
                    statusCode: 500
                });
            }
        });
    } catch (error) {
        console.error("Error in authenticateToken middleware:", error.message);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat verifikasi token.",
            statusCode: 500,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware untuk verifikasi role/permission
export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User tidak terautentikasi.",
                    statusCode: 401
                });
            }

            // Jika tidak ada role yang dispesifikasikan, izinkan semua
            if (allowedRoles.length === 0) {
                return next();
            }

            // Jika ingin menggunakan role-based access control
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Anda tidak memiliki permission untuk mengakses resource ini.",
                    statusCode: 403,
                    requiredRoles: allowedRoles,
                    userRole: req.user.role
                });
            }

            next();
        } catch (error) {
            console.error("Error in authorizeRole middleware:", error.message);
            res.status(500).json({
                success: false,
                message: "Terjadi kesalahan saat verifikasi role.",
                statusCode: 500,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};

// Middleware untuk verifikasi ownership (user hanya bisa akses data mereka sendiri)
export const verifyOwnership = (req, res, next) => {
    try {
        const userId = req.params.id;
        const authenticatedUserId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID user tidak ditemukan dalam parameter.",
                statusCode: 400
            });
        }

        if (!authenticatedUserId) {
            return res.status(401).json({
                success: false,
                message: "User tidak terautentikasi.",
                statusCode: 401
            });
        }

        // Admin bisa akses semua data
        if (req.user.role === 'admin') {
            return next();
        }

        // User biasa hanya bisa akses data mereka sendiri
        if (userId !== authenticatedUserId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Anda hanya bisa mengakses data Anda sendiri.",
                statusCode: 403
            });
        }

        next();
    } catch (error) {
        console.error("Error in verifyOwnership middleware:", error.message);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat verifikasi ownership.",
            statusCode: 500,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware untuk mencegah self-deletion
export const preventSelfDeletion = (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const authenticatedUserId = req.user.id;

        if (!targetUserId) {
            return res.status(400).json({
                success: false,
                message: "ID user tidak ditemukan dalam parameter.",
                statusCode: 400
            });
        }

        if (!authenticatedUserId) {
            return res.status(401).json({
                success: false,
                message: "User tidak terautentikasi.",
                statusCode: 401
            });
        }

        // Cegah user menghapus diri sendiri
        if (targetUserId === authenticatedUserId) {
            return res.status(400).json({
                success: false,
                message: "Anda tidak dapat menghapus akun Anda sendiri melalui endpoint ini. Silakan gunakan fitur deactivate account.",
                statusCode: 400
            });
        }

        next();
    } catch (error) {
        console.error("Error in preventSelfDeletion middleware:", error.message);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan.",
            statusCode: 500,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware untuk mencegah perubahan role sendiri (admin safety)
export const preventSelfRoleChange = (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const authenticatedUserId = req.user.id;

        if (!targetUserId) {
            return res.status(400).json({
                success: false,
                message: "ID user tidak ditemukan dalam parameter.",
                statusCode: 400
            });
        }

        // Jika ada field role di body dan user mencoba mengubah role sendiri
        if (req.body.role && targetUserId === authenticatedUserId) {
            return res.status(400).json({
                success: false,
                message: "Anda tidak dapat mengubah role Anda sendiri.",
                statusCode: 400
            });
        }

        next();
    } catch (error) {
        console.error("Error in preventSelfRoleChange middleware:", error.message);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan.",
            statusCode: 500,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};