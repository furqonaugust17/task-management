import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/user.repository.js";

const JWT_SECRET = process.env.JWT_SECRET;

// user register akun
export const registerUser = async ({ name, email, password }) => {
  // Cek apakah email sudah terdaftar
  const emailExists = await userRepo.checkEmailExists(email);
  if (emailExists) {
    throw new Error("Email sudah terdaftar");
  }

  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userRepo.createUser({ name, email, password: hashedPassword });

  return user; // Password sudah tidak di-return dari repository
};

// ambil semua data user
export const listUsers = async () => {
  return await userRepo.getAllUsers(); // Password sudah tidak di-return dari repository
};

// ambil user bedasarkan id
export const listUSerById = async (id) => {
  const user = await userRepo.getUserById(id);
  
  if (!user) {
    throw new Error("User tidak ditemukan");
  }
  
  return user; // Password sudah tidak di-return dari repository
}

// ambil user bedasarkan email
export const listByEmail = async (email) => {
  const user = await userRepo.getUserByEmailPublic(email);
  
  if (!user) {
    throw new Error("User tidak ditemukan");
  }
  
  return user; // Password sudah tidak di-return dari repository
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
      dataBody.email = email;
    }
    
    const updatedUser = await userRepo.updateUser(id, dataBody);
    
    if (!updatedUser) {
      throw new Error("User tidak ditemukan");
    }
    
    return updatedUser; // Password sudah tidak di-return dari repository
}

// update password
export const updatePassword = async (id, oldPassword, newPassword) => {
  // Gunakan fungsi yang include password untuk verifikasi
  const user = await userRepo.getUserByIdWithPassword(id);
  
  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  // Verifikasi password lama
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Password lama tidak sesuai");
  }

  if (newPassword.length < 6) {
    throw new Error("Password baru minimal 6 karakter");
  }

  // Hash password baru
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update password
  const updatedUser = await userRepo.updateUser(id, { password: hashedPassword });
  
  return updatedUser; // Password sudah tidak di-return dari repository
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

// login jwt
export const loginUser = async (email, password) => {
    // Gunakan fungsi yang include password untuk login
    const user = await userRepo.getUserByEmail(email);

    if (!user) {
        throw new Error('Email atau password salah.'); 
    }

    // Cek apakah user sudah di soft delete
    if (user.deletedAt) {
        throw new Error('Akun Anda telah dinonaktifkan. Silakan hubungi administrator.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Email atau password salah.');
    }

    const payload = {
        id: user.id,
        email: user.email,
        name: user.name
    };

    const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '24h' } // Token berlaku 24 jam
    );

    return { 
        user: { 
            id: user.id, 
            email: user.email, 
            name: user.name 
        }, 
        token 
    };
};

// get user statistics (untuk admin dashboard - opsional)
export const getUserStats = async () => {
    const totalUsers = await userRepo.countUsers();
    const recentUsers = await userRepo.getRecentUsers(5);
    
    return {
        totalUsers,
        recentUsers
    };
};

// restore soft deleted user (untuk admin - opsional)
export const restoreDeletedUser = async (id) => {
    const user = await userRepo.restoreUser(id);
    
    if (!user) {
      throw new Error("User tidak ditemukan");
    }
    
    return user;
};