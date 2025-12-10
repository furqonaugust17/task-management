import { body, param, query, validationResult } from 'express-validator';

// Helper untuk menangani hasil validasi
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validasi untuk register
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama harus diisi')
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus antara 2-100 karakter')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Nama hanya boleh mengandung huruf dan spasi'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email terlalu panjang'),
  
  body('password')
    .notEmpty().withMessage('Password harus diisi')
    .isLength({ min: 6, max: 100 }).withMessage('Password harus antara 6-100 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),
  
  handleValidationErrors
];

// Validasi untuk login
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password harus diisi'),
  
  handleValidationErrors
];

// Validasi untuk update user
export const validateUpdateUser = [
  param('id')
    .notEmpty().withMessage('ID user harus diisi')
    .isUUID().withMessage('Format ID tidak valid'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus antara 2-100 karakter')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Nama hanya boleh mengandung huruf dan spasi'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email terlalu panjang'),
  
  body('password')
    .not().exists().withMessage('Gunakan endpoint /change-password untuk mengganti password'),
  
  handleValidationErrors
];

// Validasi untuk change password
export const validateChangePassword = [
  param('id')
    .notEmpty().withMessage('ID user harus diisi')
    .isUUID().withMessage('Format ID tidak valid'),
  
  body('oldPassword')
    .notEmpty().withMessage('Password lama harus diisi'),
  
  body('newPassword')
    .notEmpty().withMessage('Password baru harus diisi')
    .isLength({ min: 6, max: 100 }).withMessage('Password baru harus antara 6-100 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password baru harus mengandung huruf besar, huruf kecil, dan angka')
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('Password baru harus berbeda dari password lama');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validasi untuk get user by ID
export const validateGetUserById = [
  param('id')
    .notEmpty().withMessage('ID user harus diisi')
    .isUUID().withMessage('Format ID tidak valid'),
  
  handleValidationErrors
];

// Validasi untuk get user by email
export const validateGetUserByEmail = [
  query('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  handleValidationErrors
];

// Validasi untuk delete (soft/hard)
export const validateDeleteUser = [
  param('id')
    .notEmpty().withMessage('ID user harus diisi')
    .isUUID().withMessage('Format ID tidak valid'),
  
  handleValidationErrors
];

// Sanitasi input untuk mencegah XSS
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Hapus HTML tags untuk mencegah XSS
        req.body[key] = req.body[key].replace(/<[^>]*>/g, '');
      }
    });
  }
  next();
};