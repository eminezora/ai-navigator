import express from 'express';
import prisma from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Helper to get Gemini Feedback
async function getGeminiQuizFeedback({ quizTitle, score, percentage, totalQuestions, correctCount, wrongCount, badge, categories }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API key is not configured, using fallback feedback.');
    return getFallbackFeedback(percentage, badge);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Lise öğrencileri için "AI Navigator" yapay zekâ okuryazarlığı eğitim platformu.
Öğrenci "${quizTitle}" başlıklı testi çözdü.
Test Sonuçları:
- Toplam Soru Sayısı: ${totalQuestions}
- Doğru Cevap: ${correctCount}
- Yanlış Cevap: ${wrongCount}
- Puan / Başarı Yüzdesi: %${percentage}
- Kazanılan Rozet: ${badge}
- Testteki Başlıca Konular: ${categories.join(', ')}

Öğrenciye hitaben Türkçe, lise seviyesinde, samimi, yapıcı, motive edici ve öğretici bir geri bildirim yaz. Hangi konularda biraz daha çalışması gerektiği veya neleri iyi yaptığı konusunda kısa öneriler ver. Yanıtın kısa ve net (en fazla 3-4 cümle veya 80 kelime) olsun.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text || getFallbackFeedback(percentage, badge);
  } catch (error) {
    console.error('Gemini feedback generation error:', error);
    return getFallbackFeedback(percentage, badge);
  }
}

function getFallbackFeedback(percentage, badge) {
  if (percentage >= 71) {
    return `Tebrikler! Testi başarıyla tamamlayarak "${badge}" rozetini kazandın. Yapay zekâ okuryazarlığı ve etik kullanım konularına oldukça hakimsin. Bu bilinçli duruşunu devam ettirerek çevrendekilere de rehberlik edebilirsin!`;
  } else if (percentage >= 41) {
    return `Güzel bir başlangıç! "${badge}" rozetini kazandın. Temel yapay zekâ kavramlarını iyi kavramışsın ancak veri güvenliği ve etik kullanım gibi konularda bazı eksiklerin bulunuyor. Modülleri tekrar inceleyerek bilgilerini pekiştirebilirsin.`;
  } else {
    return `Yapay zekâ dünyasını keşfetmek için ilk adımı attın ve "${badge}" rozetini aldın. Konuları daha iyi anlamak için öğrenme modüllerini ve örnek senaryoları dikkatlice incelemeni öneririz. Kendini geliştirdikçe puanının hızla yükseleceğine eminiz!`;
  }
}

// GET ALL QUIZZES
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let quizzes;

    if (userRole === 'admin') {
      // Admins see all quizzes with question count
      quizzes = await prisma.quiz.findMany({
        include: {
          _count: {
            select: { questions: true, results: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Students see only active quizzes
      const activeQuizzes = await prisma.quiz.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { questions: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Check if student has already solved these quizzes
      const userResults = await prisma.quizResult.findMany({
        where: { userId },
        select: { quizId: true, score: true, percentage: true }
      });

      const solvedMap = {};
      userResults.forEach(r => {
        solvedMap[r.quizId] = {
          score: r.score,
          percentage: r.percentage,
          isSolved: true
        };
      });

      quizzes = activeQuizzes.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        source: q.source,
        questionCount: q._count.questions,
        solvedInfo: solvedMap[q.id] || { isSolved: false }
      }));
    }

    res.json(quizzes);
  } catch (error) {
    console.error('Quiz listesi getirme hatası:', error);
    res.status(500).json({ error: 'Quizler listelenirken sunucu hatası oluştu.' });
  }
});

// GET SPECIFIC QUIZ
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz bulunamadı.' });
    }

    if (userRole === 'student') {
      if (!quiz.isActive) {
        return res.status(403).json({ error: 'Bu quiz şu anda aktif değil.' });
      }

      // SECURITY SANITIZATION: Remove answers and explanations for students
      const sanitizedQuestions = quiz.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        category: q.category,
        difficulty: q.difficulty
      }));

      return res.json({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: sanitizedQuestions
      });
    }

    // Admins see full quiz details
    res.json(quiz);
  } catch (error) {
    console.error('Quiz getirme hatası:', error);
    res.status(500).json({ error: 'Quiz detayları yüklenirken sunucu hatası oluştu.' });
  }
});

// ADMIN: CREATE QUIZ
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { title, description, isActive, source, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Başlık ve en az bir soru eklenmesi zorunludur.' });
    }

    // Create inside a transaction
    const newQuiz = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          title,
          description,
          isActive: isActive !== undefined ? isActive : true,
          source: source || 'manual',
          createdBy: req.user.name
        }
      });

      const questionData = questions.map(q => ({
        quizId: quiz.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        explanation: q.explanation || '',
        category: q.category || 'Yapay Zekâ',
        difficulty: q.difficulty || 'orta'
      }));

      await tx.question.createMany({
        data: questionData
      });

      return quiz;
    });

    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Quiz oluşturma hatası:', error);
    res.status(500).json({ error: 'Quiz oluşturulurken sunucu hatası oluştu.' });
  }
});

// ADMIN: EDIT QUIZ
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isActive, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Başlık ve sorular zorunludur.' });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz bulunamadı.' });
    }

    await prisma.$transaction(async (tx) => {
      // Update Quiz metadata
      await tx.quiz.update({
        where: { id },
        data: {
          title,
          description,
          isActive: isActive !== undefined ? isActive : true
        }
      });

      // Clear existing questions
      await tx.question.deleteMany({
        where: { quizId: id }
      });

      // Create new ones
      const questionData = questions.map(q => ({
        quizId: id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        explanation: q.explanation || '',
        category: q.category || 'Yapay Zekâ',
        difficulty: q.difficulty || 'orta'
      }));

      await tx.question.createMany({
        data: questionData
      });
    });

    res.json({ message: 'Quiz başarıyla güncellendi.' });
  } catch (error) {
    console.error('Quiz düzenleme hatası:', error);
    res.status(500).json({ error: 'Quiz güncellenirken sunucu hatası oluştu.' });
  }
});

// ADMIN: DELETE QUIZ
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz bulunamadı.' });
    }

    await prisma.quiz.delete({ where: { id } });
    res.json({ message: 'Quiz başarıyla silindi.' });
  } catch (error) {
    console.error('Quiz silme hatası:', error);
    res.status(500).json({ error: 'Quiz silinirken sunucu hatası oluştu.' });
  }
});

// ADMIN: COPY/DUPLICATE QUIZ
router.post('/:id/copy', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const sourceQuiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!sourceQuiz) {
      return res.status(404).json({ error: 'Kopyalanacak kaynak quiz bulunamadı.' });
    }

    const duplicatedQuiz = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          title: `${sourceQuiz.title} (Kopya)`,
          description: sourceQuiz.description,
          isActive: false, // Default copy as inactive
          source: sourceQuiz.source,
          createdBy: req.user.name
        }
      });

      const questionData = sourceQuiz.questions.map(q => ({
        quizId: quiz.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        explanation: q.explanation,
        category: q.category,
        difficulty: q.difficulty
      }));

      await tx.question.createMany({
        data: questionData
      });

      return quiz;
    });

    res.status(201).json(duplicatedQuiz);
  } catch (error) {
    console.error('Quiz kopyalama hatası:', error);
    res.status(500).json({ error: 'Quiz kopyalanırken sunucu hatası oluştu.' });
  }
});

// STUDENT: SUBMIT QUIZ ANSWERS
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // format: { questionId: "A", ... }
    const userId = req.user.id;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Cevaplar geçersiz formatta.' });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!quiz || !quiz.isActive) {
      return res.status(404).json({ error: 'Quiz bulunamadı veya aktif değil.' });
    }

    const questions = quiz.questions;
    const totalQuestions = questions.length;

    let correctCount = 0;
    const answerRecords = [];
    const evaluationDetails = [];

    questions.forEach(q => {
      const selected = answers[q.id] || '';
      const isCorrect = selected.toUpperCase() === q.correctOption.toUpperCase();

      if (isCorrect) {
        correctCount += 1;
      }

      answerRecords.push({
        questionId: q.id,
        selectedOption: selected,
        isCorrect
      });

      evaluationDetails.push({
        questionId: q.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        selectedOption: selected,
        correctOption: q.correctOption,
        explanation: q.explanation,
        isCorrect,
        category: q.category,
        difficulty: q.difficulty
      });
    });

    const score = correctCount;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const roundedPercentage = Math.round(percentage);

    // Determine Badge
    let badge = 'AI Kaşifi';
    if (roundedPercentage >= 71) {
      badge = 'AI Elçisi';
    } else if (roundedPercentage >= 41) {
      badge = 'AI Geliştirici';
    }

    // Get unique categories for prompt
    const categories = [...new Set(questions.map(q => q.category))];

    // Get Gemini feedback async (non-blocking for DB write, but we wait here to save it in result)
    const aiFeedback = await getGeminiQuizFeedback({
      quizTitle: quiz.title,
      score,
      percentage: roundedPercentage,
      totalQuestions,
      correctCount,
      wrongCount: totalQuestions - correctCount,
      badge,
      categories
    });

    // Save in DB inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      const quizResult = await tx.quizResult.create({
        data: {
          userId,
          quizId: id,
          score: parseFloat(score.toFixed(1)),
          percentage: roundedPercentage,
          badge,
          aiFeedback
        }
      });

      const fullAnswerRecords = answerRecords.map(rec => ({
        resultId: quizResult.id,
        questionId: rec.questionId,
        selectedOption: rec.selectedOption,
        isCorrect: rec.isCorrect
      }));

      await tx.answer.createMany({
        data: fullAnswerRecords
      });

      return quizResult;
    });

    res.status(201).json({
      resultId: result.id,
      score,
      percentage: roundedPercentage,
      badge,
      aiFeedback,
      totalQuestions,
      correctCount,
      wrongCount: totalQuestions - correctCount,
      details: evaluationDetails
    });
  } catch (error) {
    console.error('Quiz değerlendirme hatası:', error);
    res.status(500).json({ error: 'Quiz gönderilirken sunucu hatası oluştu.' });
  }
});

export default router;
