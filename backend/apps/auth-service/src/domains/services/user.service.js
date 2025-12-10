import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/user.repository.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Custom error class untuk konsistensi
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// user register akun
export const registerUser = async ({ name, email, password }) => {
  try {
    // Validasi input
    if (!name || !email || !password) {
      throw new AppError("Nama, email, dan password harus diisi", 400);
    }

    // Cek email sudah terdaftar
    const emailExists = await userRepo.checkEmailExists(email);
    if (emailExists) {
      throw new AppError("Email sudah terdaftar", 409); // 409 Conflict
    }

    // Validasi panjang password
    if (password.length < 6) {
      throw new AppError("Password minimal 6 karakter", 400);
    }

    // Validasi kekuatan password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      throw new AppError("Password harus mengandung huruf besar, huruf kecil, dan angka", 400);
    }

    // Hash password dengan salt rounds 12
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await userRepo.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in registerUser:", error);
    throw new AppError("Gagal melakukan registrasi", 500);
  }
};

// ambil semua data user dengan pagination dan filter
export const listUsers = async (filters) => {
  try {
    const result = await userRepo.getAllUsers(filters);
    
    if (!result || !result.users) {
      throw new AppError("Gagal mengambil data user", 500);
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in listUsers:", error);
    throw new AppError("Gagal mengambil data user", 500);
  }
};

// ambil user berdasarkan id
export const listUserById = async (id) => {
  try {
    if (!id) {
      throw new AppError("ID user harus diisi", 400);
    }

    const user = await userRepo.getUserById(id);
    
    if (!user) {
      throw new AppError("User tidak ditemukan", 404);
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in listUserById:", error);
    throw new AppError("Gagal mengambil data user", 500);
  }
};

// ambil user berdasarkan email
export const listByEmail = async (email) => {
  try {
    if (!email) {
      throw new AppError("Email harus diisi", 400);
    }

    const user = await userRepo.getUserByEmailPublic(email);
    
    if (!user) {
      throw new AppError("User tidak ditemukan", 404);
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in listByEmail:", error);
    throw new AppError("Gagal mengambil data user", 500);
  }
};

// update data user
export const updateUser = async (updateObject) => {
  try {
    const { id, password, email, ...dataBody } = updateObject;

    if (!id) {
      throw new AppError("ID user harus diisi", 400);
    }

    // Cek apakah user exists
    const existingUser = await userRepo.getUserById(id);
    if (!existingUser) {
      throw new AppError("User tidak ditemukan", 404);
    }

    // Jangan izinkan update password lewat endpoint ini
    if (password) {
      throw new AppError("Untuk mengganti password, gunakan endpoint /change-password", 400);
    }

    // Jika tidak ada data yang akan diupdate
    if (Object.keys(dataBody).length === 0 && !email) {
      throw new AppError("Tidak ada data yang akan diupdate", 400);
    }

    // Jika ada email baru, cek apakah sudah dipakai user lain
    if (email) {
      const emailExists = await userRepo.checkEmailExists(email, id);
      if (emailExists) {
        throw new AppError("Email sudah digunakan oleh user lain", 409);
      }
      dataBody.email = email.toLowerCase().trim();
    }

    // Trim nama jika ada
    if (dataBody.name) {
      dataBody.name = dataBody.name.trim();
      if (dataBody.name.length < 2) {
        throw new AppError("Nama minimal 2 karakter", 400);
      }
    }

    const updatedUser = await userRepo.updateUser(id, dataBody);

    if (!updatedUser) {
      throw new AppError("Gagal mengupdate user", 500);
    }

    return updatedUser;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in updateUser:", error);
    throw new AppError("Gagal mengupdate user", 500);
  }
};

// update password dengan validasi ketat
export const updatePassword = async (id, oldPassword, newPassword) => {
  try {
    if (!id || !oldPassword || !newPassword) {
      throw new AppError("ID, password lama, dan password baru harus diisi", 400);
    }

    // Gunakan fungsi yang include password untuk verifikasi
    const user = await userRepo.getUserByIdWithPassword(id);

    if (!user) {
      throw new AppError("User tidak ditemukan", 404);
    }

    // Cek apakah akun dihapus
    if (user.deletedAt) {
      throw new AppError("Akun telah dihapus. Silakan hubungi administrator", 403);
    }

    // Cek apakah akun aktif
    if (!user.isActive) {
      throw new AppError("Akun tidak aktif. Silakan hubungi administrator", 403);
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError("Password lama tidak sesuai", 401);
    }

    // Validasi password baru tidak boleh sama dengan password lama
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError("Password baru harus berbeda dari password lama", 400);
    }

    // Validasi panjang password
    if (newPassword.length < 6) {
      throw new AppError("Password baru minimal 6 karakter", 400);
    }

    // Validasi kekuatan password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      throw new AppError("Password baru harus mengandung huruf besar, huruf kecil, dan angka", 400);
    }

    // Hash password baru dengan salt rounds 12
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const updatedUser = await userRepo.updateUser(id, { password: hashedPassword });

    return updatedUser;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in updatePassword:", error);
    throw new AppError("Gagal mengubah password", 500);
  }
};

// hapus user selamanya
export const hardDelete = async (id) => {
  try {
    if (!id) {
      throw new AppError("ID user harus diisi", 400);
    }

    // Cek apakah user exists
    const existingUser = await userRepo.getUserById(id);
    if (!existingUser) {
      throw new AppError("User tidak ditemukan", 404);
    }

    const user = await userRepo.hardDeleteUser(id);

    if (!user) {
      throw new AppError("Gagal menghapus user", 500);
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in hardDelete:", error);
    throw new AppError("Gagal menghapus user", 500);
  }
};

// hapus user sementara
export const softDelete = async (id) => {
  try {
    if (!id) {
      throw new AppError("ID user harus diisi", 400);
    }

    // Cek apakah user exists
    const existingUser = await userRepo.getUserById(id);
    if (!existingUser) {
      throw new AppError("User tidak ditemukan", 404);
    }

    // Cek apakah sudah di-soft delete
    if (existingUser.deletedAt) {
      throw new AppError("User sudah dihapus sebelumnya", 400);
    }

    const user = await userRepo.softDeleteUser(id);

    if (!user) {
      throw new AppError("Gagal menghapus user", 500);
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in softDelete:", error);
    throw new AppError("Gagal menghapus user", 500);
  }
};

// login jwt dengan validasi lengkap
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      throw new AppError("Email dan password harus diisi", 400);
    }

    const user = await userRepo.getUserByEmail(email.toLowerCase().trim());

    if (!user) {
      throw new AppError("Email atau password salah", 401);
    }

    if (user.deletedAt) {
      throw new AppError("Akun Anda telah dihapus. Silakan hubungi administrator", 403);
    }

    if (!user.isActive) {
      throw new AppError("Akun Anda telah dinonaktifkan. Silakan hubungi administrator", 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Email atau password salah", 401);
    }

    const payload = { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        isActive: user.isActive 
      },
      token
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in loginUser:", error);
    throw new AppError("Gagal melakukan login", 500);
  }
};

// get user statistics (untuk admin dashboard)
export const getUserStats = async () => {
  try {
    const [totalUsers, activeUsers, inactiveUsers, deletedUsers, recentUsers] = await Promise.all([
      userRepo.countUsers(),
      userRepo.countUsers({ isActive: true }),
      userRepo.countUsers({ isActive: false }),
      userRepo.countUsers({ deletedAt: { not: null } }),
      userRepo.getRecentUsers(5)
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      deletedUsers,
      recentUsers
    };
  } catch (error) {
    console.error("Error in getUserStats:", error);
    throw new AppError("Gagal mengambil statistik user", 500);
  }
};

// restore soft deleted user (untuk admin)
export const restoreDeletedUser = async (id) => {
  try {
    if (!id) {
      throw new AppError("ID user harus diisi", 400);
    }

    // Cek apakah user exists (termasuk yang sudah dihapus)
    const existingUser = await userRepo.getUserByIdWithPassword(id);
    if (!existingUser) {
      throw new AppError("User tidak ditemukan", 404);
    }

    // Cek apakah user memang sudah di-soft delete
    if (!existingUser.deletedAt) {
      throw new AppError("User belum dihapus, tidak perlu di-restore", 400);
    }

    const user = await userRepo.restoreUser(id);

    if (!user) {
      throw new AppError("Gagal me-restore user", 500);
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in restoreDeletedUser:", error);
    throw new AppError("Gagal me-restore user", 500);
  }
};

// search users
export const searchUsers = async (searchTerm, page, limit) => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      throw new AppError("Search term tidak boleh kosong", 400);
    }

    const result = await userRepo.searchUsers(searchTerm.trim(), page, limit);

    if (!result) {
      throw new AppError("Gagal mencari user", 500);
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in searchUsers:", error);
    throw new AppError("Gagal mencari user", 500);
  }
};

// toggle user status (activate/deactivate)
export const toggleUserStatus = async (id) => {
  try {
    if (!id) {
      throw new AppError("ID user harus diisi", 400);
    }

    // Cek apakah user exists
    const existingUser = await userRepo.getUserById(id);
    if (!existingUser) {
      throw new AppError("User tidak ditemukan", 404);
    }

    // Cek apakah user sudah dihapus
    if (existingUser.deletedAt) {
      throw new AppError("Tidak dapat mengubah status user yang sudah dihapus", 400);
    }

    const user = await userRepo.toggleUserStatus(id);

    if (!user) {
      throw new AppError("Gagal mengubah status user", 500);
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in toggleUserStatus:", error);
    throw new AppError("Gagal mengubah status user", 500);
  }
};

// validate token
export const validateToken = (token) => {
  try {
    if (!token) {
      throw new AppError("Token harus diisi", 400);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, data: decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError("Token sudah kadaluarsa", 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError("Token tidak valid", 401);
    }
    throw new AppError("Gagal memvalidasi token", 500);
  }
};

// refresh token
export const refreshToken = async (oldToken) => {
  try {
    if (!oldToken) {
      throw new AppError("Token harus diisi", 400);
    }

    let decoded;
    try {
      decoded = jwt.verify(oldToken, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError("Token sudah kadaluarsa", 401);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError("Token tidak valid", 401);
      }
      throw error;
    }

    // Cek apakah user masih ada dan aktif
    const user = await userRepo.getUserById(decoded.id);

    if (!user) {
      throw new AppError("User tidak ditemukan", 404);
    }

    if (user.deletedAt) {
      throw new AppError("Akun Anda telah dihapus. Silakan hubungi administrator", 403);
    }

    if (!user.isActive) {
      throw new AppError("Akun Anda telah dinonaktifkan. Silakan hubungi administrator", 403);
    }

    // Generate token baru
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const newToken = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in refreshToken:", error);
    throw new AppError("Gagal me-refresh token", 500);
  }
};

export { AppError };