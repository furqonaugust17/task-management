// Middleware untuk handle 404
export const notFound = (req, res, next) => {
  const error = new Error(`Route tidak ditemukan - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware untuk handle semua error
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error untuk debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: 'Data sudah ada. Email mungkin sudah terdaftar.',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'Data tidak ditemukan',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      
      case 'P2003':
        return res.status(400).json({
          success: false,
          message: 'Referensi data tidak valid',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token sudah kadaluarsa. Silakan login kembali.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Default error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Async handler untuk menangkap error dari async functions
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};