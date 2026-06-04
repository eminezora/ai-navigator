import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ai_navigator_super_secret_jwt_2026_key';

// REGISTER STUDENT
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, passwordConfirm, className, schoolNumber } = req.body;

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurun.' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ error: 'Şifreler eşleşmiyor.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır.' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (always student role for self-registration)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'student',
        className,
        schoolNumber
      }
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Kayıt başarılı.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        className: user.className,
        schoolNumber: user.schoolNumber
      }
    });
  } catch (error) {
    console.error('Kayıt Hatası:', error);
    res.status(500).json({ error: 'Kayıt sırasında sunucu hatası oluştu.' });
  }
});

// LOGIN ADMIN & STUDENT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Lütfen e-posta ve şifrenizi girin.' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: 'Hatalı e-posta veya şifre.' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Hatalı e-posta veya şifre.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Giriş başarılı.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        className: user.className,
        schoolNumber: user.schoolNumber
      }
    });
  } catch (error) {
    console.error('Giriş Hatası:', error);
    res.status(500).json({ error: 'Giriş sırasında sunucu hatası oluştu.' });
  }
});

// GET ME
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      className: user.className,
      schoolNumber: user.schoolNumber
    });
  } catch (error) {
    console.error('Kullanıcı Verisi Getirme Hatası:', error);
    res.status(500).json({ error: 'Kullanıcı bilgisi alınırken sunucu hatası oluştu.' });
  }
});

export default router;
