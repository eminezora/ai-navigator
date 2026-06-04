import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ClipboardCheck, BarChart2, AlertTriangle, Clock, Star, TrendingUp, HelpCircle, Sparkles } from 'lucide-react';

export default function AdminDashboard({ setActivePage, setAdminQuizView }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/users/admin-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!stats) return <div className="text-center py-10">Yönetici verileri yüklenemedi.</div>;

  // Custom SVG Bar Chart Renderer for Class Performance
  const renderClassChart = () => {
    const classes = stats.classPerformance || [];
    if (classes.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
          Grafik için henüz yeterli veri yok.
        </div>
      );
    }

    const width = 500;
    const height = 200;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const barHeight = Math.min(25, chartHeight / classes.length - 8);
    const maxVal = 100;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        {/* Y Axis line */}
        <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="rgba(15,23,42,0.15)" />
        {/* X Axis line */}
        <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="rgba(15,23,42,0.15)" />

        {classes.map((c, i) => {
          const y = paddingTop + i * (chartHeight / classes.length) + (chartHeight / classes.length - barHeight) / 2;
          const barWidth = (c.average / maxVal) * chartWidth;

          return (
            <g key={i} className="group">
              {/* Class Name (Y Axis Label) */}
              <text x={paddingLeft - 8} y={y + barHeight / 2 + 4} textAnchor="end" fill="rgba(15,23,42,0.7)" fontSize="10" fontWeight="bold">
                {c.className}
              </text>

              {/* Bar background */}
              <rect x={paddingLeft} y={y} width={chartWidth} height={barHeight} fill="rgba(15,23,42,0.03)" rx="4" />

              {/* Glowing active bar */}
              <rect x={paddingLeft} y={y} width={barWidth} height={barHeight} fill="url(#bar-gradient)" rx="4" className="transition-all duration-300 hover:brightness-110" />

              {/* Bar Value */}
              <text x={paddingLeft + barWidth + 6} y={y + barHeight / 2 + 4} fill="#0284c7" fontSize="9" fontWeight="bold">
                %{c.average}
              </text>
            </g>
          );
        })}

        {/* Gradients */}
        <defs>
          <linearGradient id="bar-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <BarChart2 className="text-sky-400" />
          Yönetici Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Eğitim platformunun genel katılım, başarı oranları ve konu dağılımlarını takip edin.
        </p>
      </div>

      {/* AI Quick Action Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-500/10 via-emerald-500/5 to-transparent">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-1 flex items-center gap-1.5">
            <Sparkles className="text-sky-400 animate-pulse" size={20} />
            Yapay Zekâ ile Anında Yeni Bir Quiz Üretin
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl font-light">
            Google Gemini destekli otomatik soru hazırlama asistanını kullanarak lise müfredatına ve istediğiniz konuya özel testleri saniyeler içinde tasarlayın.
          </p>
        </div>
        <button
          onClick={() => {
            setAdminQuizView('create-ai-form');
            setActivePage('admin-quizzes');
          }}
          className="px-5 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Sparkles size={16} />
          Yapay Zekâ ile Quiz Oluştur
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Kayıtlı Öğrenci</p>
            <p className="text-3xl font-bold text-slate-100 mt-1">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Mevcut Quizler</p>
            <p className="text-3xl font-bold text-slate-100 mt-1">{stats.totalQuizzes}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Çözülme Sayısı</p>
            <p className="text-3xl font-bold text-slate-100 mt-1">{stats.totalSolves}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Star size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Ortalama Başarı</p>
            <p className="text-3xl font-bold text-slate-100 mt-1">%{stats.averageScore}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Charts and Top Wrong Questions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Class chart card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <TrendingUp className="text-sky-400" size={20} />
              Sınıf Başarı Ortalamaları
            </h3>
            {renderClassChart()}
          </div>

          {/* Top Wrong Questions */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2 text-red-400">
              <AlertTriangle size={20} />
              En Çok Yanlış Yapılan Sorular
            </h3>

            {stats.topWrongQuestions.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                Henüz yeterli yanlış cevabı olan soru bulunmuyor.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topWrongQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-200 leading-snug break-words">
                        {q.text}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                        Sınav: {q.quizTitle}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">
                        {q.count} Hatalı Yanıt
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Rankings & Recent Solves */}
        <div className="space-y-8">
          {/* Category Performance */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <HelpCircle className="text-teal-400" size={20} />
              Kategori Başarı Oranları
            </h3>

            {stats.categoryPerformance.length === 0 ? (
              <div className="text-slate-500 text-sm text-center py-6">Kategori analizi için veri yok.</div>
            ) : (
              <div className="space-y-4">
                {stats.categoryPerformance.map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-300">{c.category}</span>
                      <span className="font-bold text-sky-400">%{c.successRate}</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-sky-400 to-teal-400 h-full rounded-full"
                        style={{ width: `${c.successRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Leaderboard */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400" size={20} />
              En Başarılı Öğrenciler
            </h3>

            {stats.studentPerformances.length === 0 ? (
              <div className="text-slate-500 text-sm text-center py-6">Başarı listesi için veri yok.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {stats.studentPerformances.map((s, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? 'bg-amber-400 text-slate-950' :
                        idx === 1 ? 'bg-slate-300 text-slate-950' :
                        idx === 2 ? 'bg-amber-600 text-slate-950' :
                        'bg-white/5 text-slate-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{s.name}</p>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">{s.className}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-sky-400">%{s.average}</p>
                      <p className="text-[9px] text-slate-400 font-semibold">{s.quizzesSolved} Quiz</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent solved table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 mt-8">
        <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Clock className="text-sky-400" size={20} />
          Son Çözülen Quizler
        </h3>

        {stats.recentSolves.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            Henüz çözülen sınav yok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 font-semibold">Öğrenci</th>
                  <th className="py-3 px-4 font-semibold text-center">Sınıf</th>
                  <th className="py-3 px-4 font-semibold">Quiz Başlığı</th>
                  <th className="py-3 px-4 font-semibold text-center">Doğru</th>
                  <th className="py-3 px-4 font-semibold text-center">Başarı</th>
                  <th className="py-3 px-4 font-semibold text-center">Rozet</th>
                  <th className="py-3 px-4 font-semibold text-right">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentSolves.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4 font-medium text-slate-100">{r.studentName}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold uppercase">{r.className}</td>
                    <td className="py-3.5 px-4 text-slate-200">{r.quizTitle}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-sky-400">{r.score}</td>
                    <td className="py-3.5 px-4 text-center font-bold">%{r.percentage}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/5 text-slate-300">
                        <span>{r.badge === 'AI Elçisi' ? '🥇' : r.badge === 'AI Geliştirici' ? '🥈' : '🥉'}</span>
                        {r.badge}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(r.date).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
