import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/User.repository.js";

// user register akun
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await userRepo.getUserByEmail(email);
  if (existingUser) throw new Error("Email sudah terdaftar");

  const hashedPassword = await bcrypt.hash(password, 10);
  return await userRepo.createUser({ name, email, password: hashedPassword });
};

// ambil semua data user
export const listUsers = async () => {
  return await userRepo.getAllUsers();
};

// ambil user bedasarkan id
export const listUSerById = async (id) => {
  return await userRepo.getUserById(id);
}

// ambil user bedasarkan email
export const listByEmail = async (email) => {
  return await userRepo.getUserByEmail(email);
}

// update data user
export const updateUser = async (updateObject) => {     
    const { id, ...dataBody } = updateObject; 
    return await userRepo.updateUser(id, dataBody);
}

// hapus user selamanya
export const hardDelete = async (id) => {
    return await userRepo.hardDeleteUser(id); 
};

// hapuse user sementara
export const softDelete = async (id) => {
    return await userRepo.softDeleteUser(id); 
};

// login jwt
const JWT_SECRET = process.env.JWT_SECRET;
export const loginUser = async (email, password) => {
    const user = await userRepo.getUserByEmail(email);

    if (!user) {
        throw new Error('Email atau password salah.'); 
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Email atau password salah.');
    }

    const payload = {
        id: user.id,
        email: user.email,
    };

    const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    return { 
        user: { 
            id: user.id, 
            email: user.email, 
            nama: user.nama 
        }, 
        token 
    };
};