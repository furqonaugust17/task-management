import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware untuk verifikasi token JWT
export const authenticateToken = (req, res, next) => {
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
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "Token tidak valid atau sudah kadaluarsa."
                });
            }

            // Simpan data user dari token ke request object
            req.user = decoded;
            next();
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

// Middleware untuk verifikasi role/permission (opsional untuk fitur lanjutan)
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