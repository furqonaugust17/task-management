import {
    registerUser,
    listUsers,
    listUserById,
    listByEmail,
    updateUser,
    softDelete,
    hardDelete,
    loginUser,
    updatePassword,
    getUserStats,
    restoreDeletedUser,
    searchUsers,
    toggleUserStatus,
    validateToken,
    refreshToken
} from "../services/user.service.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

// register controller - Registrasi terbuka untuk siapa saja
export const register = asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        success: true,
        message: "User berhasil register",
        data: user
    });
});

// login controller
export const loginController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.status(200).json({
        success: true,
        message: 'Login berhasil!',
        data: result.user,
        token: result.token
    });
});

// ambil profil user yang sedang login
export const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const user = await listUserById(userId);

    res.status(200).json({
        success: true,
        message: "Berhasil mengambil data profil",
        data: user
    });
});

// ambil semua data user dengan pagination dan filter
export const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, isActive, includeDeleted = false } = req.query;

    const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        includeDeleted: includeDeleted === 'true'
    };

    const result = await listUsers(filters);

    res.status(200).json({
        success: true,
        message: "Berhasil mengambil data user",
        data: result.users,
        pagination: result.pagination
    });
});

// ambil user berdasarkan id nya
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await listUserById(Number(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message
    });
  }
};

// ambil user berdasarkan emailnya
export const getUserByEmail = asyncHandler(async (req, res) => {
    try {
        const { email } = req.query;
        const user = await listByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
            error: error.message
        });
    }
});

// search users
export const searchUsersController = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
        return res.status(400).json({
            success: false,
            message: "Parameter 'q' (search term) harus diisi"
        });
    }

    const result = await searchUsers(q, parseInt(page), parseInt(limit));

    res.status(200).json({
        success: true,
        message: "Berhasil mencari user",
        data: result.users,
        pagination: result.pagination
    });
});

// update data user
export const updateUsers = asyncHandler(async (req, res) => {
    const updateObject = {
        id: req.params.id,
        ...req.body
    };

    const user = await updateUser(updateObject);

    res.status(200).json({
        success: true,
        message: "Berhasil mengupdate user",
        data: user
    });
});

// ganti password
export const changePassword = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    const result = await updatePassword(userId, oldPassword, newPassword);

    res.status(200).json({
        success: true,
        message: "Password berhasil diubah",
        data: result
    });
});

// hard delete
export const hardDeleteController = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await hardDelete(userId);

    res.status(200).json({
        success: true,
        message: "Berhasil menghapus user secara permanen",
        data: user
    });
});

// soft delete
export const softDeleteController = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await softDelete(userId);

    res.status(200).json({
        success: true,
        message: `User dengan ID ${userId} berhasil di-soft delete.`,
        data: user
    });
});

// get user statistics (admin only)
export const getUserStatsController = asyncHandler(async (req, res) => {
    const stats = await getUserStats();

    res.status(200).json({
        success: true,
        message: "Berhasil mengambil statistik user",
        data: stats
    });
});

// restore soft deleted user (admin only)
export const restoreUserController = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await restoreDeletedUser(userId);

    res.status(200).json({
        success: true,
        message: "User berhasil di-restore",
        data: user
    });
});

// toggle user status (activate/deactivate) - admin only
export const toggleUserStatusController = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await toggleUserStatus(userId);

    res.status(200).json({
        success: true,
        message: `User berhasil ${user.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
        data: user
    });
});

// validate token
export const validateTokenController = asyncHandler(async (req, res) => {
    const token = req.body.token || req.query.token;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Token harus disertakan"
        });
    }

    const result = validateToken(token);

    if (!result.valid) {
        return res.status(401).json({
            success: false,
            message: "Token tidak valid",
            error: result.error
        });
    }

    res.status(200).json({
        success: true,
        message: "Token valid",
        data: result.data
    });
});

// refresh token
export const refreshTokenController = asyncHandler(async (req, res) => {
    const token = req.body.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Token harus disertakan"
        });
    }

    const result = await refreshToken(token);

    res.status(200).json({
        success: true,
        message: "Token berhasil di-refresh",
        data: result.user,
        token: result.token
    });
});