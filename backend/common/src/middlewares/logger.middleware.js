// Custom logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Log response setelah selesai
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  });
  
  next();
};

// Logger untuk sensitive operations
export const sensitiveLogger = (operation) => {
  return (req, res, next) => {
    console.log(`[SENSITIVE] ${operation} - User: ${req.user?.email || 'Unknown'} - IP: ${req.ip} - Time: ${new Date().toISOString()}`);
    next();
  };
};