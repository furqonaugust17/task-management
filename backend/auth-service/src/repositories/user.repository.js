import Prisma from "../config/database.js";

// membuat user
export const createUser = async (data) => {
  try {
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
  } catch (error) {
    console.error("Error in createUser repository:", error);
    throw error;
  }
};

// ambil data user berdasarkan email (termasuk password untuk login)
export const getUserByEmail = async (email) => {
  try {
    return await Prisma.user.findUnique({ 
      where: { email } 
    });
  } catch (error) {
    console.error("Error in getUserByEmail repository:", error);
    throw error;
  }
};

// ambil data user berdasarkan email (tanpa password untuk public)
export const getUserByEmailPublic = async (email) => {
  try {
    return await Prisma.user.findUnique({ 
      where: { email },
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
  } catch (error) {
    console.error("Error in getUserByEmailPublic repository:", error);
    throw error;
  }
};

// ambil semua data user (exclude yang sudah di soft delete)
export const getAllUsers = async (filters = {}) => {
  try {
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
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error("Error in getAllUsers repository:", error);
    throw error;
  }
};

// ambil data user berdasarkan id
export const getUserById = async (id) => {
  try {
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
  } catch (error) {
    console.error("Error in getUserById repository:", error);
    throw error;
  }
};

// ambil data user berdasarkan id (include password untuk verifikasi)
export const getUserByIdWithPassword = async (id) => {
  try {
    return await Prisma.user.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error("Error in getUserByIdWithPassword repository:", error);
    throw error;
  }
};

// update data user
export const updateUser = async (id, data) => {
  try {
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
  } catch (error) {
    console.error("Error in updateUser repository:", error);
    throw error;
  }
};

// delete user menggunakan hard delete
export const hardDeleteUser = async (id) => {
  try {
    return await Prisma.user.delete({ 
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        deletedAt: true
      }
    });
  } catch (error) {
    console.error("Error in hardDeleteUser repository:", error);
    throw error;
  }
};

// hapus user menggunakan soft delete
export const softDeleteUser = async (id) => {
  try {
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
        isActive: true,
        deletedAt: true
      }
    });
  } catch (error) {
    console.error("Error in softDeleteUser repository:", error);
    throw error;
  }
};

// cek apakah user dengan email tertentu sudah ada (untuk validasi)
export const checkEmailExists = async (email, excludeUserId = null) => {
  try {
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
  } catch (error) {
    console.error("Error in checkEmailExists repository:", error);
    throw error;
  }
};

// count total users (untuk statistik)
export const countUsers = async (filters = {}) => {
  try {
    const where = {
      deletedAt: null,
      ...filters
    };
    
    return await Prisma.user.count({ where });
  } catch (error) {
    console.error("Error in countUsers repository:", error);
    throw error;
  }
};

// ambil user yang baru saja dibuat (untuk admin dashboard)
export const getRecentUsers = async (limit = 10) => {
  try {
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
  } catch (error) {
    console.error("Error in getRecentUsers repository:", error);
    throw error;
  }
};

// restore soft deleted user (untuk admin)
export const restoreUser = async (id) => {
  try {
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
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true
      }
    });
  } catch (error) {
    console.error("Error in restoreUser repository:", error);
    throw error;
  }
};

// ambil semua user termasuk yang di-soft delete (untuk admin)
export const getAllUsersIncludingDeleted = async () => {
  try {
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
  } catch (error) {
    console.error("Error in getAllUsersIncludingDeleted repository:", error);
    throw error;
  }
};

// search users by name or email
export const searchUsers = async (searchTerm, page = 1, limit = 10) => {
  try {
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
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error("Error in searchUsers repository:", error);
    throw error;
  }
};

// Toggle user active status
export const toggleUserStatus = async (id) => {
  try {
    const user = await getUserById(id);
    
    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    return await Prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });
  } catch (error) {
    console.error("Error in toggleUserStatus repository:", error);
    throw error;
  }
};