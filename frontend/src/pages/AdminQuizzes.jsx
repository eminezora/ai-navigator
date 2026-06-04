import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardCheck, Sparkles, Plus, Trash2, Copy, ToggleLeft, ToggleRight, Edit, X, Save, AlertCircle, Eye, ArrowLeft, Brain, HelpCircle } from 'lucide-react';

export default function AdminQuizzes({ view: propView, setView: propSetView }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Wizards State: 'list' | 'create-manual' | 'edit-manual' | 'create-ai'
  const [internalView, setInternalView] = useState('list');
  const view = propView || internalView;
  const setView = propSetView || setInternalView;
  const [editingQuizId, setEditingQuizId] = useState(null);

  // Manual Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState([
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '', category: 'Yapay Zekâ', difficulty: 'orta' }
  ]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // AI Generator Form State
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (view === 'list') {
      fetchQuizzes();
    }
  }, [view]);

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

  const handleToggleActive = async (quiz) => {
    try {
      await axios.put(`/api/quizzes/${quiz.id}`, {
        title: quiz.title,
        description: quiz.description,
        isActive: !quiz.isActive,
        questions: quiz.questions // Or backend handles updating just isActive
      });
      fetchQuizzes();
    } catch (error) {
      console.error('Error toggling quiz status:', error);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Bu quizi ve tüm çözülme sonuçlarını silmek istediğinizden emin misiniz?')) return;
    try {
      await axios.delete(`/api/quizzes/${id}`);
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const handleCopyQuiz = async (id) => {
    try {
      await axios.post(`/api/quizzes/${id}/copy`);
      fetchQuizzes();
    } catch (error) {
      console.error('Error copying quiz:', error);
    }
  };

  const handleAddBlankQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '', category: 'Yapay Zekâ', difficulty: 'orta' }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, val) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  // EDIT INITIATOR
  const handleEditInit = async (quizId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/quizzes/${quizId}`);
      const q = response.data;
      setTitle(q.title);
      setDescription(q.description || '');
      setIsActive(q.isActive);
      setQuestions(q.questions || []);
      setEditingQuizId(quizId);
      setView('edit-manual');
    } catch (error) {
      console.error('Error loading quiz for edit:', error);
    } finally {
      setLoading(false);
    }
  };

  // SAVE MANUAL / EDITED QUIZ
  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!title.trim()) {
      setFormError('Quiz başlığı zorunludur.');
      return;
    }

    const invalidQuestion = questions.some(q => 
      !q.questionText.trim() || !q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()
    );

    if (invalidQuestion) {
      setFormError('Lütfen tüm soruları ve seçenekleri eksiksiz doldurun.');
      return;
    }

    setSaving(true);
    try {
      if (view === 'create-manual' || view === 'create-ai') {
        // Create Quiz
        await axios.post('/api/quizzes', {
          title,
          description,
          isActive,
          source: view === 'create-ai' ? 'gemini' : 'manual',
          questions
        });
      } else {
        // Edit Quiz
        await axios.put(`/api/quizzes/${editingQuizId}`, {
          title,
          description,
          isActive,
          questions
        });
      }
      setView('list');
      resetForm();
    } catch (error) {
      setFormError(error.response?.data?.error || 'Quiz kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  // GENERATE VIA GEMINI
  const handleGenerateAiQuiz = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setGenerating(true);
    setFormError('');

    try {
      const response = await axios.post('/api/ai/generate-quiz', {
        prompt: aiPrompt
      });

      // Populate preview questions
      setQuestions(response.data.map(q => ({
        questionText: q.questionText || '',
        optionA: q.optionA || '',
        optionB: q.optionB || '',
        optionC: q.optionC || '',
        optionD: q.optionD || '',
        correctOption: q.correctOption || 'A',
        explanation: q.explanation || '',
        category: q.category || 'Yapay Zekâ',
        difficulty: q.difficulty || 'orta'
      })));

      setTitle('AI Üretimi Quiz');
      setDescription('Yapay zekâ talimatı ile otomatik olarak oluşturulmuş test.');
      setIsActive(false); // Save generated quiz as inactive by default
      setView('create-ai');
    } catch (error) {
      setFormError(error.response?.data?.error || 'Yapay zekâ ile quiz oluşturulurken hata meydana geldi.');
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIsActive(true);
    setQuestions([
      { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '', category: 'Yapay Zekâ', difficulty: 'orta' }
    ]);
    setEditingQuizId(null);
    setAiPrompt('');
  };

  if (loading && view === 'list') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      {view === 'list' && (
        /* QUIZ LIST VIEW */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
                <ClipboardCheck className="text-sky-400" />
                Quiz Yönetimi
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Eğitim modüllerine ait quizler ekleyin, düzenleyin, kopyalayın veya yapay zekâ ile otomatik sorular üretin.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setView('create-ai-form');
                  resetForm();
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-sky-500 hover:brightness-110 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <Sparkles size={16} />
                Yapay Zekâ ile Quiz Oluştur
              </button>
              <button
                onClick={() => {
                  setView('create-manual');
                  resetForm();
                }}
                className="px-4 py-2.5 glass-button text-slate-200 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} />
                Yeni Quiz Ekle
              </button>
            </div>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-12 text-slate-500 glass-panel p-8 rounded-2xl border-white/5">
              Kayıtlı quiz bulunamadı. Yapay zekâ veya manuel olarak yeni bir quiz ekleyin.
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="py-3 px-6 font-semibold">Başlık</th>
                      <th className="py-3 px-6 font-semibold">Türü</th>
                      <th className="py-3 px-6 font-semibold">Oluşturan</th>
                      <th className="py-3 px-6 font-semibold text-center">Soru</th>
                      <th className="py-3 px-6 font-semibold text-center">Durum</th>
                      <th className="py-3 px-6 font-semibold text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {quizzes.map((quiz) => (
                      <tr key={quiz.id} className="hover:bg-white/[0.01]">
                        <td className="py-3.5 px-6 font-medium text-slate-100">
                          <div>
                            <p>{quiz.title}</p>
                            <p className="text-[10px] text-slate-400 max-w-sm truncate mt-0.5 font-light">{quiz.description}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            quiz.source === 'gemini'
                              ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                          }`}>
                            {quiz.source === 'gemini' ? 'AI (Gemini)' : 'Manuel'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-400 text-xs font-semibold">{quiz.createdBy}</td>
                        <td className="py-3.5 px-6 text-center font-bold text-sky-400">{quiz._count?.questions || 0}</td>
                        <td className="py-3.5 px-6 text-center">
                          <button
                            onClick={() => handleToggleActive(quiz)}
                            className="p-1 rounded text-slate-300 hover:text-white inline-flex items-center cursor-pointer"
                            title={quiz.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                          >
                            {quiz.isActive ? (
                              <ToggleRight className="text-emerald-400 w-8 h-8" />
                            ) : (
                              <ToggleLeft className="text-slate-500 w-8 h-8" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleEditInit(quiz.id)}
                            className="p-1.5 rounded-lg glass-button text-xs text-sky-300 inline-flex items-center gap-1 cursor-pointer"
                            title="Quizi Düzenle"
                          >
                            <Edit size={14} />
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleCopyQuiz(quiz.id)}
                            className="p-1.5 rounded-lg glass-button text-xs text-teal-300 inline-flex items-center cursor-pointer"
                            title="Quizi Kopyala"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 inline-flex items-center cursor-pointer"
                            title="Quizi Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'create-ai-form' && (
        /* GEMINI GENERATOR CONFIGURATION FORM */
        <div className="max-w-xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl border-white/10 shadow-2xl relative animate-scaleUp">
          <button
            onClick={() => setView('list')}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="text-center mb-6">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl inline-block mb-3">
              <Brain size={32} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-100">Yapay Zekâ ile Quiz Üret</h3>
            <p className="text-xs text-slate-400 mt-1 font-light">
              Yapay zekaya istediğiniz quizi tarif edin. Google Gemini soruları anında oluşturacaktır.
            </p>
          </div>

          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-lg mb-4">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleGenerateAiQuiz} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Yapay Zekâya Talimat Verin (Prompt)
              </label>
              <textarea
                required
                rows="5"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Örn: 10. Sınıf öğrencileri için Yapay Zekâda Telif Hakları konusunda 5 soruluk, orta zorlukta, öğretici açıklamaları olan çoktan seçmeli bir quiz tasarla."
                className="w-full p-4 rounded-xl glass-input text-sm focus:outline-none resize-none leading-relaxed"
              ></textarea>
            </div>

            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">💡 Örnek Yapay Zekâ Talimatları</span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setAiPrompt('Deepfake teknolojileri, manipülasyon ve dijital güvenilirlik üzerine lise seviyesinde 3 soruluk bir etik testi oluştur.')}
                  className="text-left text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                >
                  🎭 <strong>Deepfake & Güvenlik:</strong> Lise düzeyinde 3 soruluk etik testi.
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt('Yapay zekâ araçlarında telif hakları, veri sahipliği ve sanat etiği konularında 2 soruluk kolay seviyede bir quiz tasarla.')}
                  className="text-left text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                >
                  ⚖️ <strong>Telif Hakları & Sanat:</strong> Yapay zekâda veri sahipliği.
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt('Yapay zekâ ve kişisel verilerin korunması (KVKK), veri gizliliği ve algoritma yanlılığı üzerine 2 soruluk orta seviye bir sınav hazırla.')}
                  className="text-left text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                >
                  🔒 <strong>Veri Gizliliği & KVKK:</strong> Kişisel verilerin korunması ve gizlilik.
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating || !aiPrompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-sky-500 hover:brightness-110 disabled:brightness-75 text-slate-955 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-6"
            >
              {generating ? (
                <>
                  <span className="w-5 h-5 border-2 border-slate-955 border-t-transparent rounded-full animate-spin"></span>
                  Sorular Üretiliyor...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Gemini ile Soruları Üret
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {(view === 'create-manual' || view === 'edit-manual' || view === 'create-ai') && (
        /* MANAGE QUESTIONS / WIZARD EDITOR FOR MANUAL AND GENERATED PREVIEWS */
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('list')}
                className="p-2 rounded-lg glass-button text-slate-300 hover:text-white cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  {view === 'create-manual' ? 'Yeni Sınav Oluştur' : view === 'edit-manual' ? 'Quizi Düzenle' : 'Yapay Zekâ Soru Önizleme ve Düzenleme'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {view === 'create-ai' ? 'Gemini tarafından üretilen soruları gözden geçirin, kaydedin.' : 'Quiz sorularını elle tasarlayın.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveQuiz}
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:brightness-110 disabled:brightness-75 text-slate-955 font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-slate-955 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save size={14} />
                  Sınavı Kaydet ve Yayınla
                </>
              )}
            </button>
          </div>

          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-lg">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {/* Quiz Metadata */}
          <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2">Quiz Bilgileri</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quiz Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="Yapay Zekâ ve Etik Prensipler"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Açıklama (Opsiyonel)</label>
                <textarea
                  placeholder="Bu sınavda nelerin ölçüldüğünü açıklayın..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm focus:outline-none resize-none"
                ></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="quiz-active-toggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-white/15 bg-white/5 text-sky-500 focus:ring-0"
                />
                <label htmlFor="quiz-active-toggle" className="text-sm font-semibold text-slate-200 cursor-pointer">
                  Aktif ve Çözülebilir Yap
                </label>
              </div>
            </div>
          </div>

          {/* Questions Array Setup */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mt-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Soru Listesi ({questions.length})</h4>
              <button
                onClick={handleAddBlankQuestion}
                className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-sky-400 font-semibold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                Yeni Soru Ekle
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border-white/10 relative space-y-4">
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveQuestion(idx)}
                  disabled={questions.length === 1}
                  className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-red-400 disabled:opacity-20 cursor-pointer"
                  title="Soruyu Sil"
                >
                  <Trash2 size={16} />
                </button>

                <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                  Soru {idx + 1}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  {/* Question text */}
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Soru Metni</label>
                    <input
                      type="text"
                      required
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                      placeholder="Örnek: Aşağıdakilerden hangisi..."
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs focus:outline-none"
                    />
                  </div>

                  {/* Options */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seçenek A</label>
                    <input
                      type="text"
                      required
                      value={q.optionA}
                      onChange={(e) => handleQuestionChange(idx, 'optionA', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seçenek B</label>
                    <input
                      type="text"
                      required
                      value={q.optionB}
                      onChange={(e) => handleQuestionChange(idx, 'optionB', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seçenek C</label>
                    <input
                      type="text"
                      required
                      value={q.optionC}
                      onChange={(e) => handleQuestionChange(idx, 'optionC', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seçenek D</label>
                    <input
                      type="text"
                      required
                      value={q.optionD}
                      onChange={(e) => handleQuestionChange(idx, 'optionD', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs focus:outline-none"
                    />
                  </div>

                  {/* Settings */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doğru Seçenek</label>
                    <select
                      value={q.correctOption}
                      onChange={(e) => handleQuestionChange(idx, 'correctOption', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs focus:outline-none"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kategori</label>
                    <input
                      type="text"
                      value={q.category}
                      onChange={(e) => handleQuestionChange(idx, 'category', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Zorluk</label>
                    <select
                      value={q.difficulty}
                      onChange={(e) => handleQuestionChange(idx, 'difficulty', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs focus:outline-none"
                    >
                      <option value="kolay">Kolay</option>
                      <option value="orta">Orta</option>
                      <option value="zor">Zor</option>
                    </select>
                  </div>

                  {/* Explanation */}
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pedagojik Geri Bildirim / Açıklama</label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                      placeholder="Doğru seçeneğin gerekçesini yazın (Öğrenciye sınav bitince gösterilir)..."
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-6">
            <button
              onClick={() => setView('list')}
              className="px-6 py-2.5 glass-button text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              onClick={handleSaveQuiz}
              disabled={saving}
              className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:brightness-110 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center gap-1 cursor-pointer"
            >
              {saving ? (
                <span className="w-5 h-5 border-2 border-slate-955 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Kaydet ve Yayınla'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
