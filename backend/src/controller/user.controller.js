import { 
    registerUser, 
    listUsers, 
    listUSerById,
    listByEmail,
    updateUser,
    softDelete,
    hardDelete,
    loginUser
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
        res.status(200).json({
            success: false,
            message: "gagal mengambil semua data user",
            error: error.message
        });      
    }
}

// ambbil user bedasarkan id nya
export const getUserById = async (req,res) => {
    try {
        const user = await listUSerById(req.params.id);

        res.status(200).json({
            success: true,
            message: "berhasil mengambil data user bedasarkan ID",
            data: user
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

        res.status(200).json({
            success: true,
            message: "Berhasil mengambil user berdasarkan email",
            data: user // Data user ada
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

        res.status(200).json({
            success: true,
            message: "Berhasil mengupdate user",
            data: user
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

// hard delte
export const hardDeleteController = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
             return res.status(400).json({ success: false, message: "ID user diperlukan." });
        }
        
        // 1. Panggil Service Layer yang benar (hardDeleteUser)
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
        // Tangani error 404 dari Prisma di sini (P2025: Record Not Found)
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