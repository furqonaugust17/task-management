import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/user.repository.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// user register akun
export const registerUser = async ({ name, email, password }) => {
  const emailExists = await userRepo.checkEmailExists(email);
  if (emailExists) {
    return { success: false, statusCode: 400, message: "Email sudah terdaftar" };
  }

  if (password.length < 6) {
    return { success: false, statusCode: 400, message: "Password minimal 6 karakter" };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  if (!passwordRegex.test(password)) {
    return { success: false, statusCode: 400, message: "Password harus mengandung huruf besar, huruf kecil, dan angka" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await userRepo.createUser({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword
  });

  return { success: true, statusCode: 201, data: user };
};

// ambil semua data user dengan pagination dan filter
export const listUsers = async (filters) => {
    return await userRepo.getAllUsers(filters);
};

// ambil user berdasarkan id
export const listUserById = async (id) => {
  const user = await userRepo.getUserById(id);
  if (!user) {
    return { success: false, statusCode: 404, message: "User tidak ditemukan" };
  }
  return { success: true, statusCode: 200, data: user };
};

// ambil user berdasarkan email
export const listByEmail = async (email) => {
    const user = await userRepo.getUserByEmailPublic(email);
    return user;
}

// update data user
export const updateUser = async (updateObject) => {
    const { id, password, email, ...dataBody } = updateObject;

    // Jangan izinkan update password lewat endpoint ini
    if (password) {
        throw new Error("Untuk mengganti password, gunakan endpoint change-password");
    }

    // Jika ada email baru, cek apakah sudah dipakai user lain
    if (email) {
        const emailExists = await userRepo.checkEmailExists(email, id);
        if (emailExists) {
            throw new Error("Email sudah digunakan oleh user lain");
        }
        dataBody.email = email.toLowerCase().trim();
    }

    // Trim nama jika ada
    if (dataBody.name) {
        dataBody.name = dataBody.name.trim();
    }

    const updatedUser = await userRepo.updateUser(id, dataBody);

    if (!updatedUser) {
        throw new Error("User tidak ditemukan");
    }

    return updatedUser;
}

// update password dengan validasi ketat
export const updatePassword = async (id, oldPassword, newPassword) => {
    // Gunakan fungsi yang include password untuk verifikasi
    const user = await userRepo.getUserByIdWithPassword(id);

    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    // Cek apakah akun aktif
    if (!user.isActive) {
        throw new Error("Akun tidak aktif. Silakan hubungi administrator");
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
        throw new Error("Password lama tidak sesuai");
    }

    // Validasi password baru tidak boleh sama dengan password lama
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new Error("Password baru harus berbeda dari password lama");
    }

    // Validasi panjang password
    if (newPassword.length < 6) {
        throw new Error("Password baru minimal 6 karakter");
    }

    // Validasi kekuatan password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
        throw new Error("Password baru harus mengandung huruf besar, huruf kecil, dan angka");
    }

    // Hash password baru dengan salt rounds 12
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const updatedUser = await userRepo.updateUser(id, { password: hashedPassword });

    return updatedUser;
}

// hapus user selamanya
export const hardDelete = async (id) => {
    const user = await userRepo.hardDeleteUser(id);

    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    return user;
};

// hapus user sementara
export const softDelete = async (id) => {
    const user = await userRepo.softDeleteUser(id);

    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    return user;
};

// login jwt dengan validasi lengkap
export const loginUser = async (email, password) => {
    const user = await userRepo.getUserByEmail(email.toLowerCase().trim());

    if (!user) {
        return { success: false, statusCode: 401, message: "Email atau password salah" };
    }
    if (user.deletedAt) {
        return { success: false, statusCode: 403, message: "Akun Anda telah dihapus. Silakan hubungi administrator" };
    }
    if (!user.isActive) {
        return { success: false, statusCode: 403, message: "Akun Anda telah dinonaktifkan. Silakan hubungi administrator" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return { success: false, statusCode: 401, message: "Email atau password salah" };
    }

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
        success: true,
        statusCode: 200,
        data: {
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token
        }
    };
};


// get user statistics (untuk admin dashboard)
export const getUserStats = async () => {
    const [totalUsers, activeUsers, inactiveUsers, recentUsers] = await Promise.all([
        userRepo.countUsers(),
        userRepo.countUsers({ isActive: true }),
        userRepo.countUsers({ isActive: false }),
        userRepo.getRecentUsers(5)
    ]);

    return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        recentUsers
    };
};

// restore soft deleted user (untuk admin)
export const restoreDeletedUser = async (id) => {
    const user = await userRepo.restoreUser(id);

    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    return user;
};

// search users
export const searchUsers = async (searchTerm, page, limit) => {
    if (!searchTerm || searchTerm.trim() === '') {
        throw new Error("Search term tidak boleh kosong");
    }

    return await userRepo.searchUsers(searchTerm.trim(), page, limit);
};

// toggle user status (activate/deactivate)
export const toggleUserStatus = async (id) => {
    return await userRepo.toggleUserStatus(id);
};

// validate token
export const validateToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { valid: true, data: decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};

// refresh token
export const refreshToken = async (oldToken) => {
    try {
        const decoded = jwt.verify(oldToken, JWT_SECRET);

        // Cek apakah user masih ada dan aktif
        const user = await userRepo.getUserById(decoded.id);

        if (!user || !user.isActive || user.deletedAt) {
            throw new Error('User tidak valid');
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
        throw new Error('Token tidak valid atau sudah kadaluarsa');
    }
};