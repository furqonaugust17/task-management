import rateLimit from 'express-rate-limit';

// Rate limiter untuk endpoint umum
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // limit 100 requests per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak request dari IP ini, silakan coba lagi setelah 15 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter ketat untuk autentikasi (login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // limit 5 percobaan login per 15 menit
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.'
  },
  skipSuccessfulRequests: true, // tidak menghitung request yang berhasil
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk register
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 3, // limit 3 registrasi per IP per jam
  message: {
    success: false,
    message: 'Terlalu banyak registrasi dari IP ini. Silakan coba lagi setelah 1 jam.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk operasi CRUD
export const crudLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 50, // limit 50 operasi per 15 menit
  message: {
    success: false,
    message: 'Terlalu banyak operasi. Silakan coba lagi setelah 15 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk operasi sensitif (delete, change password)
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 10, // limit 10 operasi sensitif per jam
  message: {
    success: false,
    message: 'Terlalu banyak operasi sensitif. Silakan coba lagi setelah 1 jam.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk endpoint profil
export const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 30, // limit 30 requests per 15 menit
  message: {
    success: false,
    message: 'Terlalu banyak request. Silakan coba lagi setelah 15 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});