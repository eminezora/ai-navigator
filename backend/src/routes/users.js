import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ADMIN: GET STUDENTS (LIST & SEARCH)
router.get('/students', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { search } = req.query;

    let whereClause = { role: 'student' };
    if (search) {
      whereClause = {
        role: 'student',
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { className: { contains: search } },
          { schoolNumber: { contains: search } }
        ]
      };
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        className: true,
        schoolNumber: true,
        createdAt: true,
        _count: {
          select: { quizResults: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(students);
  } catch (error) {
    console.error('Öğrenci listesi getirme hatası:', error);
    res.status(500).json({ error: 'Öğrenciler listelenirken sunucu hatası oluştu.' });
  }
});

// ADMIN: GET STUDENT DETAILS (WITH HISTORY)
router.get('/students/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({
      where: { id, role: 'student' },
      select: {
        id: true,
        name: true,
        email: true,
        className: true,
        schoolNumber: true,
        createdAt: true,
        quizResults: {
          select: {
            id: true,
            score: true,
            percentage: true,
            badge: true,
            aiFeedback: true,
            createdAt: true,
            quiz: {
              select: { title: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı.' });
    }

    res.json(student);
  } catch (error) {
    console.error('Öğrenci detayı getirme hatası:', error);
    res.status(500).json({ error: 'Öğrenci detayları getirilirken sunucu hatası oluştu.' });
  }
});

// ADMIN: CREATE NEW STUDENT
router.post('/students', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, className, schoolNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'İsim, e-posta ve şifre zorunludur.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const student = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'student',
        className,
        schoolNumber
      },
      select: {
        id: true,
        name: true,
        email: true,
        className: true,
        schoolNumber: true,
        createdAt: true
      }
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Öğrenci oluşturma hatası:', error);
    res.status(500).json({ error: 'Öğrenci oluşturulurken sunucu hatası oluştu.' });
  }
});

// ADMIN: DELETE STUDENT
router.delete('/students/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({
      where: { id, role: 'student' }
    });

    if (!student) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı.' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Öğrenci başarıyla silindi.' });
  } catch (error) {
    console.error('Öğrenci silme hatası:', error);
    res.status(500).json({ error: 'Öğrenci silinirken sunucu hatası oluştu.' });
  }
});

// STUDENT: GET PANEL / DASHBOARD STATS
router.get('/student-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all results for this student
    const results = await prisma.quizResult.findMany({
      where: { userId },
      include: {
        quiz: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalQuizzes = results.length;
    const lastQuizScore = totalQuizzes > 0 ? results[0].score : 0;
    
    // Average score percentage
    const overallSuccess = totalQuizzes > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes)
      : 0;

    // Badges calculation
    const badges = [];
    const hasKaşif = results.some(r => r.badge === 'AI Kaşifi');
    const hasGeliştirici = results.some(r => r.badge === 'AI Geliştirici');
    const hasElçi = results.some(r => r.badge === 'AI Elçisi');

    if (hasKaşif) badges.push({ id: 'kasif', name: 'AI Kaşifi', icon: '🥉', desc: 'İlk keşif adımlarını tamamladın.' });
    if (hasGeliştirici) badges.push({ id: 'gelistirici', name: 'AI Geliştirici', icon: '🥈', desc: 'Yapay zekâ kavramlarında gelişim gösterdin.' });
    if (hasElçi) badges.push({ id: 'elci', name: 'AI Elçisi', icon: '🥇', desc: 'Yapay zekâ etik elçisi olmaya hak kazandın!' });

    // Format chart data: last 10 attempts
    const chartData = results.slice(0, 10).reverse().map(r => ({
      date: new Date(r.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      quizTitle: r.quiz.title.length > 15 ? r.quiz.title.substring(0, 15) + '...' : r.quiz.title,
      score: r.score,
      percentage: r.percentage
    }));

    res.json({
      totalQuizzes,
      lastQuizScore,
      overallSuccess,
      badges,
      resultsHistory: results.map(r => ({
        id: r.id,
        quizTitle: r.quiz.title,
        score: r.score,
        percentage: r.percentage,
        badge: r.badge,
        aiFeedback: r.aiFeedback,
        createdAt: r.createdAt
      })),
      chartData
    });
  } catch (error) {
    console.error('Öğrenci istatistikleri getirme hatası:', error);
    res.status(500).json({ error: 'Panel istatistikleri yüklenirken sunucu hatası oluştu.' });
  }
});

// ADMIN: GET MAIN DASHBOARD STATS & ANALYTICS
router.get('/admin-stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'student' } });
    const totalQuizzes = await prisma.quiz.count();

    const allResults = await prisma.quizResult.findMany({
      include: {
        user: { select: { className: true, name: true } },
        quiz: { select: { title: true } }
      }
    });

    const totalSolves = allResults.length;
    const averageScore = totalSolves > 0
      ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / totalSolves)
      : 0;

    // 1. Classroom averages
    const classGroups = {};
    allResults.forEach(r => {
      const cls = r.user.className || 'Belirtilmemiş';
      if (!classGroups[cls]) {
        classGroups[cls] = { total: 0, count: 0 };
      }
      classGroups[cls].total += r.percentage;
      classGroups[cls].count += 1;
    });
    const classPerformance = Object.keys(classGroups).map(cls => ({
      className: cls,
      average: Math.round(classGroups[cls].total / classGroups[cls].count),
      count: classGroups[cls].count
    })).sort((a, b) => b.average - a.average);

    // 2. Category averages
    // To get category averages, we check the answers joined with question
    const answersWithQuestion = await prisma.answer.findMany({
      include: {
        question: { select: { category: true } }
      }
    });

    const categoryGroups = {};
    answersWithQuestion.forEach(a => {
      const cat = a.question.category || 'Genel';
      if (!categoryGroups[cat]) {
        categoryGroups[cat] = { correct: 0, total: 0 };
      }
      categoryGroups[cat].total += 1;
      if (a.isCorrect) {
        categoryGroups[cat].correct += 1;
      }
    });

    const categoryPerformance = Object.keys(categoryGroups).map(cat => ({
      category: cat,
      successRate: Math.round((categoryGroups[cat].correct / categoryGroups[cat].total) * 100),
      totalAnswers: categoryGroups[cat].total
    })).sort((a, b) => b.successRate - a.successRate);

    // 3. Most incorrectly answered questions (top 5)
    const wrongAnswers = await prisma.answer.findMany({
      where: { isCorrect: false },
      include: {
        question: {
          select: {
            questionText: true,
            quiz: { select: { title: true } }
          }
        }
      }
    });

    const questionCounts = {};
    wrongAnswers.forEach(w => {
      const qid = w.questionId;
      if (!questionCounts[qid]) {
        questionCounts[qid] = {
          text: w.question.questionText,
          quizTitle: w.question.quiz.title,
          count: 0
        };
      }
      questionCounts[qid].count += 1;
    });

    const topWrongQuestions = Object.values(questionCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Student success board (average score per student)
    const studentGroups = {};
    allResults.forEach(r => {
      const sId = r.userId;
      if (!studentGroups[sId]) {
        studentGroups[sId] = { name: r.user.name, className: r.user.className, total: 0, count: 0 };
      }
      studentGroups[sId].total += r.percentage;
      studentGroups[sId].count += 1;
    });

    const studentPerformances = Object.values(studentGroups).map(s => ({
      name: s.name,
      className: s.className || 'Belirtilmemiş',
      average: Math.round(s.total / s.count),
      quizzesSolved: s.count
    })).sort((a, b) => b.average - a.average).slice(0, 5);

    // 5. Recent Solved Quizzes
    const recentSolves = allResults
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        studentName: r.user.name,
        className: r.user.className || 'Belirtilmemiş',
        quizTitle: r.quiz.title,
        score: r.score,
        percentage: r.percentage,
        badge: r.badge,
        date: r.createdAt
      }));

    res.json({
      totalStudents,
      totalQuizzes,
      totalSolves,
      averageScore,
      classPerformance,
      categoryPerformance,
      topWrongQuestions,
      studentPerformances,
      recentSolves
    });
  } catch (error) {
    console.error('Yönetici istatistikleri getirme hatası:', error);
    res.status(500).json({ error: 'Yönetici istatistikleri yüklenirken sunucu hatası oluştu.' });
  }
});

export default router;
