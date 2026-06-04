import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Compass, HelpCircle, CheckCircle, XCircle, AlertCircle, ArrowRight, ArrowLeft, RefreshCw, Calendar } from 'lucide-react';

export default function SmartQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { qId: "A" }
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (quizId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/quizzes/${quizId}`);
      setActiveQuiz(response.data);
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setResults(null);
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const response = await axios.post(`/api/quizzes/${activeQuiz.id}/submit`, {
        answers: selectedAnswers
      });
      setResults(response.data);
      fetchQuizzes(); // Refresh list to update solved state
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToList = () => {
    setActiveQuiz(null);
    setResults(null);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  // 1. QUIZ LIST VIEW
  if (!activeQuiz && !results) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 relative">
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <Award className="text-sky-400" />
            Akıllı Quiz Sistemi
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Yapay zekâ, etik, telif hakları ve siber güvenlik konularında aktif testleri çözerek rozetler kazan.
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-12 text-slate-500 glass-panel p-8 rounded-2xl border-white/5">
            Mevcut aktif quiz bulunamadı. Lütfen daha sonra tekrar kontrol edin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className={`p-6 rounded-2xl glass-card flex flex-col justify-between border ${
                  quiz.solvedInfo?.isSolved ? 'border-emerald-500/25 bg-emerald-500/[0.02]' : 'border-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                      Soru Sayısı: {quiz.questionCount}
                    </span>
                    {quiz.solvedInfo?.isSolved && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        Çözüldü (%{quiz.solvedInfo.percentage})
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2 leading-snug">{quiz.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed font-light mb-6">
                    {quiz.description}
                  </p>
                </div>

                <button
                  onClick={() => handleStartQuiz(quiz.id)}
                  className={`mt-4 w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    quiz.solvedInfo?.isSolved
                      ? 'glass-button text-sky-300'
                      : 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:brightness-110 text-slate-950 shadow-md shadow-sky-500/10'
                  }`}
                >
                  {quiz.solvedInfo?.isSolved ? 'Tekrar Çöz' : 'Sınava Başla'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. QUIZ RUNNING / SOLVING VIEW
  if (activeQuiz && !results) {
    const questions = activeQuiz.questions || [];
    const totalQ = questions.length;
    const currentQ = questions[currentQuestionIdx];
    const progressPercent = totalQ > 0 ? ((currentQuestionIdx + 1) / totalQ) * 100 : 0;

    if (totalQ === 0) {
      return (
        <div className="text-center py-10">
          Bu quizde henüz soru yok.
          <button onClick={handleBackToList} className="mt-4 px-4 py-2 bg-sky-500 text-slate-950 rounded-lg">Geri Dön</button>
        </div>
      );
    }

    const isAnswered = selectedAnswers[currentQ.id] !== undefined;
    const selectedOption = selectedAnswers[currentQ.id] || '';

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 relative">
        {/* Progress header */}
        <div className="glass-panel p-4 rounded-xl border-white/10 mb-6 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Soru {currentQuestionIdx + 1} / {totalQ}
          </span>
          <div className="flex-1 max-w-md bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <button
            onClick={handleBackToList}
            className="text-xs text-red-400 hover:underline font-semibold cursor-pointer"
          >
            Sınavdan Çık
          </button>
        </div>

        {/* Question Panel */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border-white/10 shadow-xl mb-6 min-h-[350px] flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10">
              {currentQ.category}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-3 leading-relaxed">
              {currentQ.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-3 mt-8">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optKey = `option${opt}`;
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(currentQ.id, opt)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-400 text-sky-300 font-medium'
                        : 'bg-white/[0.02] border-white/5 text-slate-200 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-sky-400 text-slate-900' : 'bg-white/10 text-slate-300'
                    }`}>
                      {opt}
                    </span>
                    <span className="flex-1 leading-snug">{currentQ[optKey]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/5">
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-4 py-2.5 glass-button text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft size={14} />
              Önceki Soru
            </button>

            {currentQuestionIdx < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.min(totalQ - 1, prev + 1))}
                disabled={!isAnswered}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:brightness-75 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                Sonraki Soru
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={!isAnswered || submitting}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:brightness-110 disabled:brightness-75 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Testi Tamamla
                    <CheckCircle size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. QUIZ RESULTS SUMMARY VIEW (PEDAGOGY REVIEW)
  if (results) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 relative">
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none pulse-glow"></div>

        {/* Results Header Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/15 shadow-2xl mb-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden">
          {/* Badge icon overlay */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* Badge Display */}
          <div className="w-28 h-28 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-5xl relative shadow-lg">
            <span className="drop-shadow-[0_4px_10px_rgba(255,255,255,0.4)]">
              {results.badge === 'AI Elçisi' ? '🥇' : results.badge === 'AI Geliştirici' ? '🥈' : '🥉'}
            </span>
            <span className="absolute bottom-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {results.badge.split(' ')[1]}
            </span>
          </div>

          <div className="flex-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wide">
              Test Başarıyla Tamamlandı
            </span>
            <h2 className="text-2xl font-extrabold text-slate-100 mt-2 mb-3">
              Kazanılan Rozet: <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">{results.badge}</span>
            </h2>

            {/* Performance metrics */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-300">
              <div>Doğru: <span className="text-emerald-400">{results.correctCount}</span></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
              <div>Yanlış: <span className="text-red-400">{results.wrongCount}</span></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
              <div>Başarı: <span className="text-sky-400">%{results.percentage}</span></div>
            </div>
          </div>

          <button
            onClick={handleBackToList}
            className="px-5 py-3 glass-button text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer w-full md:w-auto"
          >
            Sınav Listesine Dön
          </button>
        </div>

        {/* Gemini Feedback */}
        <div className="glass-panel p-6 rounded-2xl border-white/10 mb-8 bg-sky-500/[0.01]">
          <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Compass size={16} />
            Yapay Zekâ Eğitmen Yorumu
          </h4>
          <blockquote className="text-sm leading-relaxed text-slate-200 italic font-light pl-4 border-l-2 border-sky-500/50">
            "{results.aiFeedback}"
          </blockquote>
        </div>

        {/* Detailed Question Review */}
        <h3 className="text-lg font-bold text-slate-100 mb-4">Soru İnceleme ve Açıklamalar</h3>
        <div className="space-y-6">
          {results.details.map((q, idx) => (
            <div
              key={q.questionId}
              className={`p-6 rounded-2xl border ${
                q.isCorrect ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : 'border-red-500/20 bg-red-500/[0.01]'
              } glass-panel`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Soru {idx + 1}</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                    {q.category}
                  </span>
                </div>
                {q.isCorrect ? (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={14} /> Doğru
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                    <XCircle size={14} /> Yanlış
                  </span>
                )}
              </div>

              <h4 className="font-bold text-slate-100 leading-relaxed mb-4">{q.questionText}</h4>

              {/* Display Options review */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const isUserSelected = q.selectedOption === opt;
                  const isCorrectAnswer = q.correctOption === opt;

                  let optionStyle = 'border-white/5 bg-white/[0.01] text-slate-400';
                  if (isCorrectAnswer) {
                    optionStyle = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold';
                  } else if (isUserSelected && !q.isCorrect) {
                    optionStyle = 'border-red-500/30 bg-red-500/10 text-red-400 font-semibold';
                  }

                  return (
                    <div key={opt} className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${optionStyle}`}>
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isCorrectAnswer
                          ? 'bg-emerald-400 text-slate-900'
                          : isUserSelected && !q.isCorrect
                          ? 'bg-red-400 text-slate-900'
                          : 'bg-white/5 text-slate-300'
                      }`}>
                        {opt}
                      </span>
                      <span>{q[`option${opt}`]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Pedagogy Explanation */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs leading-relaxed text-slate-300 font-light flex gap-2">
                <AlertCircle size={14} className="shrink-0 text-sky-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Açıklama: </span>
                  {q.explanation || 'Bu sorunun doğru cevabına dair eğitsel açıklama bulunmuyor.'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
