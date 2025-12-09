// Middleware untuk handle 404
export const notFound = (req, res, next) => {
  const error = new Error(`Route tidak ditemukan - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware untuk handle semua error
export const errorHandler = (err, req, res, next) => {
  // Gunakan statusCode dari error jika ada, atau dari response
  let statusCode = err.statusCode || res.statusCode;
  
  // Jika statusCode masih 200, set ke 500 (Internal Server Error)
  if (statusCode === 200) {
    statusCode = 500;
  }
  
  // Log error untuk debugging
  console.error('Error:', {
    message: err.message,
    statusCode: statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    body: process.env.NODE_ENV === 'development' ? req.body : undefined,
    timestamp: new Date().toISOString()
  });

  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: 'Data sudah ada. Email mungkin sudah terdaftar.',
          field: err.meta?.target?.[0],
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

      case 'P2014':
        return res.status(400).json({
          success: false,
          message: 'Data yang diupdate melanggar constraint',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });

      case 'P2016':
        return res.status(500).json({
          success: false,
          message: 'Query interpretation error',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });

      case 'P2021':
        return res.status(500).json({
          success: false,
          message: 'Tabel tidak ditemukan di database',
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

  if (err.name === 'NotBeforeError') {
    return res.status(401).json({
      success: false,
      message: 'Token belum aktif',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: err.errors,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Handle Multer errors (file upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File terlalu besar. Maksimal 10MB',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Terlalu banyak file',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Field file tidak valid',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  // Handle MongoDB CastError (jika menggunakan MongoDB)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Format ID tidak valid',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Handle SyntaxError (JSON parsing error)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Format JSON tidak valid',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Handle bcrypt errors
  if (err.message && err.message.includes('bcrypt')) {
    return res.status(500).json({
      success: false,
      message: 'Error pada enkripsi password',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Default error response dengan statusCode yang tepat
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    statusCode: statusCode,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Async handler untuk menangkap error dari async functions
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};