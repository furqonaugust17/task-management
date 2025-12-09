import Prisma from "../config/database.js";

// membuat user
export const createUser = async (data) => {
  return await Prisma.user.create({ data });
};

// ambil data user bedasarkan email
export const getUserByEmail = async (email) => {
  return await Prisma.user.findUnique({ 
    where: { 
      email,
    } 
  });
};

// ambil smua data user
export const getAllUsers = async () => {
  return await Prisma.user.findMany({
        where: {
            deletedAt: null
          }
    });
};

// ambil data user bedasarkan id
export const getUserById = async (id) => {
  return await Prisma.user.findUnique({
    where: { id },
  });
};

// update daya user
export const updateUser = async (id, data) => {
  return await Prisma.user.update({ 
    where: { id }, 
    data 
  });
};

// delete user menggunakan hard delete
export const hardDeleteUser = async (id) => {
    return await Prisma.user.delete({ 
        where: { id } 
    });
};

// hapus user menggunakan soft delet
export const softDeleteUser = async (id) => {
    return await Prisma.user.update({
        where: { id },
        data: { 
            deletedAt: new Date() 
        }
    });
};