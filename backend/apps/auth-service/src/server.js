require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import Routes
const authRoutes = require('./interface/http/routes/auth.routes');

// Import Shared Libs (Bukti koneksi ke Monorepo berhasil)
const { errorMiddleware } = require('@libs/common'); 
// Pastikan di libs/common/index.js sudah mengekspor middleware error

const app = express();

// --- Middlewares Standar ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Routes ---
// Semua route auth akan diawali /api/v1/auth
app.use('/api/v1/auth', authRoutes);

// --- Error Handling ---
// app.use(errorMiddleware); // Uncomment jika library sudah siap

// --- Start Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Auth Service running on port ${PORT}`);
  console.log(`🔗 Connected to Database via Prisma`);
});