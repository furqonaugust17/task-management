import Prisma from "../config/database.js";

// membuat user
export const createUser = async (data) => {
  return await Prisma.user.create({ 
    data,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      upadtedAt: true,
      deletedAt: true
      // password tidak di-select untuk keamanan
    }
  });
};

// ambil data user bedasarkan email (termasuk password untuk login)
export const getUserByEmail = async (email) => {
  return await Prisma.user.findUnique({ 
    where: { 
      email,
    } 
  });
};

// ambil data user bedasarkan email (tanpa password untuk public)
export const getUserByEmailPublic = async (email) => {
  return await Prisma.user.findUnique({ 
    where: { 
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      upadtedAt: true,
      deletedAt: true
    }
  });
};

// ambil semua data user (exclude yang sudah di soft delete)
export const getAllUsers = async () => {
  return await Prisma.user.findMany({
    where: {
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      upadtedAt: true,
      deletedAt: true
      // password tidak di-select
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

// ambil data user bedasarkan id
export const getUserById = async (id) => {
  return await Prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      upadtedAt: true,
      deletedAt: true
      // password tidak di-select
    }
  });
};

// ambil data user bedasarkan id (include password untuk verifikasi)
export const getUserByIdWithPassword = async (id) => {
  return await Prisma.user.findUnique({
    where: { id }
    // include semua field termasuk password
  });
};

// update data user
export const updateUser = async (id, data) => {
  return await Prisma.user.update({ 
    where: { id }, 
    data,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      upadtedAt: true,
      deletedAt: true
      // password tidak di-select
    }
  });
};

// delete user menggunakan hard delete
export const hardDeleteUser = async (id) => {
  return await Prisma.user.delete({ 
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      deletedAt: true
    }
  });
};

// hapus user menggunakan soft delete
export const softDeleteUser = async (id) => {
  return await Prisma.user.update({
    where: { id },
    data: { 
      deletedAt: new Date() 
    },
    select: {
      id: true,
      name: true,
      email: true,
      deletedAt: true
    }
  });
};

// cek apakah user dengan email tertentu sudah ada (untuk validasi)
export const checkEmailExists = async (email, excludeUserId = null) => {
  const where = { email };
  
  if (excludeUserId) {
    where.id = {
      not: excludeUserId
    };
  }
  
  const user = await Prisma.user.findUnique({
    where,
    select: { id: true }
  });
  
  return !!user; // return true jika ada, false jika tidak
};

// count total users (untuk statistik)
export const countUsers = async () => {
  return await Prisma.user.count({
    where: {
      deletedAt: null
    }
  });
};

// ambil user yang baru saja dibuat (untuk admin dashboard)
export const getRecentUsers = async (limit = 10) => {
  return await Prisma.user.findMany({
    where: {
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });
};

// restore soft deleted user (untuk admin)
export const restoreUser = async (id) => {
  return await Prisma.user.update({
    where: { id },
    data: {
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      deletedAt: true
    }
  });
};

// ambil semua user termasuk yang di-soft delete (untuk admin)
export const getAllUsersIncludingDeleted = async () => {
  return await Prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      upadtedAt: true,
      deletedAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};