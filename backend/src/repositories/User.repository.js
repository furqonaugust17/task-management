import Prisma from "../config/database.js";

// membuat user
export const createUser = async (data) => {
  return await Prisma.user.create({ 
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
      // password tidak di-select untuk keamanan
    }
  });
};

// ambil data user berdasarkan email (termasuk password untuk login)
export const getUserByEmail = async (email) => {
  return await Prisma.user.findUnique({ 
    where: { 
      email,
    } 
  });
};

// ambil data user berdasarkan email (tanpa password untuk public)
export const getUserByEmailPublic = async (email) => {
  return await Prisma.user.findUnique({ 
    where: { 
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    }
  });
};

// ambil semua data user (exclude yang sudah di soft delete)
export const getAllUsers = async (filters = {}) => {
  const { includeDeleted = false, role, isActive, page = 1, limit = 10 } = filters;
  
  const where = {};
  
  if (!includeDeleted) {
    where.deletedAt = null;
  }
  
  if (role) {
    where.role = role;
  }
  
  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    Prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    Prisma.user.count({ where })
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// ambil data user berdasarkan id
export const getUserById = async (id) => {
  return await Prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    }
  });
};

// ambil data user berdasarkan id (include password untuk verifikasi)
export const getUserByIdWithPassword = async (id) => {
  return await Prisma.user.findUnique({
    where: { id }
  });
};

// update data user
export const updateUser = async (id, data) => {
  return await Prisma.user.update({ 
    where: { id }, 
    data: {
      ...data,
      updatedAt: new Date()
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
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
      deletedAt: new Date(),
      isActive: false
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
  
  return !!user;
};

// count total users (untuk statistik)
export const countUsers = async (filters = {}) => {
  const where = {
    deletedAt: null,
    ...filters
  };
  
  return await Prisma.user.count({ where });
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
      role: true,
      isActive: true,
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
      deletedAt: null,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
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
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

// search users by name or email
export const searchUsers = async (searchTerm, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const where = {
    deletedAt: null,
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } }
    ]
  };

  const [users, total] = await Promise.all([
    Prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    Prisma.user.count({ where })
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Toggle user active status
export const toggleUserStatus = async (id) => {
  const user = await getUserById(id);
  
  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  return await Prisma.user.update({
    where: { id },
    data: {
      isActive: !user.isActive
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true
    }
  });
};