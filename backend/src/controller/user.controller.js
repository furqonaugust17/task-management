import { 
    registerUser, 
    listUsers, 
    listUSerById,
    listByEmail,
    updateUser,
    softDelete,
    hardDelete,
    loginUser,
    updatePassword
} from "../services/user.service.js";

// register controller
export const register = async (req,res) =>{
    try {
        const user = await registerUser(req.body);
        res.status(200).json({
            success: true,
            message: "User berhasil register",
            data: user
        });
    } catch (error) {
        console.error("error register", error.message);
        res.status(500).json({
            success: false,
            message: "User Gagal Register",
            error: error.message
        })        
    }
}

// ambil profil user yang sedang login
export const getProfile = async (req, res) => {
    try {
        // Data user sudah ada di req.user dari middleware authenticateToken
        const userId = req.user.id;
        const user = await listUSerById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        // Jangan kirim password
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: "Berhasil mengambil data profil",
            data: userWithoutPassword
        });
    } catch (error) {
        console.error("error get profile", error.message);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data profil",
            error: error.message
        });
    }
}

// ambil semua data user 
export const getAlluser = async (req,res) => {
    try {
        const user = await listUsers();

        res.status(200).json({
            success: true,
            message: "berhasil mengambil data user",
            data: user
        });
    } catch (error) {
        console.error("error get all user");
        res.status(500).json({
            success: false,
            message: "gagal mengambil semua data user",
            error: error.message
        });      
    }
}

// ambil user bedasarkan id nya
export const getUserById = async (req,res) => {
    try {
        const user = await listUSerById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        // Jangan kirim password
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: "berhasil mengambil data user bedasarkan ID",
            data: userWithoutPassword
        });
    } catch (error) {
        console.error("error get all user");
        res.status(500).json({
            success: false,
            message: "gagal mengambil semua data user berdasarkan ID",
            error: error.message
        });      
    }
}

// ambil user bedasarkan emailnya
export const getUserByEmails = async (req, res) => {
    try {
        const emailBody = req.query.email;

        const user = await listByEmail(emailBody);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        // Jangan kirim password
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: "Berhasil mengambil user berdasarkan email",
            data: userWithoutPassword
        });

    } catch (error) {
        console.error("error get user by email", error.message);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil user berdasarkan email",
            error: error.message
        });
    }
}

// update data user
export const updateUSers = async (req, res) => {
    try {
    
    const updateObject = {
        id: req.params.id, 
        ...req.body 
    };
    
    const user = await updateUser(updateObject);

        // Jangan kirim password
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: "Berhasil mengupdate user",
            data: userWithoutPassword
        });
    } catch (error) {
        console.error("error update", error.message)
        res.status(500).json({
            success: false,
            message: "Gagal mengupdate user",
            error: error.message
        });
    }
}

// ganti password
export const changePassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Password lama dan password baru harus diisi"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password baru minimal 6 karakter"
            });
        }

        const result = await updatePassword(userId, oldPassword, newPassword);

        res.status(200).json({
            success: true,
            message: "Password berhasil diubah",
            data: result
        });
    } catch (error) {
        console.error("error change password", error.message);
        
        if (error.message.includes("Password lama tidak sesuai")) {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Gagal mengubah password",
            error: error.message
        });
    }
}

// hard delete
export const hardDeleteController = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
             return res.status(400).json({ success: false, message: "ID user diperlukan." });
        }
        
        const user = await hardDelete(userId); 
          
        res.status(200).json({
            success: true,
            message: "Berhasil menghapus user secara permanen",
            data: user
        });
        
    } catch (error) {
        if (error.code === 'P2025') {
             return res.status(404).json({
                success: false,
                message: `User dengan ID ${req.params.id} tidak ditemukan.`,
             });
        }
        
        console.error("error hard delete", error.message);
        res.status(500).json({
            success: false,
            message: "Gagal menghapus user",
            error: error.message
        });
    }
}

// soft delete
export const softDeleteController = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
             return res.status(400).json({ success: false, message: "ID user diperlukan." });
        }

        const user = await softDelete(userId); 

        res.status(200).json({
            success: true,
            message: `User dengan ID ${userId} berhasil di-soft delete.`,
            data: user
        });

    } catch (error) {
        if (error.code === 'P2025') {
             return res.status(404).json({
                success: false,
                message: `User dengan ID ${req.params.id} tidak ditemukan untuk soft delete.`,
             });
        }
        
        console.error("error soft delete", error.message);
        res.status(500).json({
            success: false,
            message: "Gagal melakukan soft delete user",
            error: error.message
        });
    }
}

// login jwt
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body; 
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email dan password harus diisi.' 
            });
        }
        
        const result = await loginUser(email, password);

        res.status(200).json({
            success: true,
            message: 'Login berhasil!',
            data: result.user,
            token: result.token
        });

    } catch (error) {
        const statusCode = error.message.includes('Email atau password salah') ? 401 : 500;
        console.error("error login:", error.message);
        res.status(statusCode).json({
            success: false,
            message: error.message,
            error: error.message
        });
    }
};