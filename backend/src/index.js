import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import quizRoutes from './routes/quizzes.js';
import aiRoutes from './routes/ai.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({
  origin: '*', // For local dev flexibility, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/ai', aiRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Navigator API - Yapay Zekâ Okuryazarlığı ve Etik Kullanım Platformu',
    status: 'running',
    time: new Date()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Sunucu Hatası:', err);
  res.status(500).json({ error: 'Sunucuda beklenmeyen bir hata oluştu.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
