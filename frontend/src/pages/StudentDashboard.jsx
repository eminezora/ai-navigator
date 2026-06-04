import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Award, Calendar, BookOpen, ChevronRight, BarChart2, Star, Eye, MessageSquareCode, AwardIcon, Compass } from 'lucide-react';

export default function StudentDashboard({ setActivePage }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/users/student-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching student stats:', error);
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

  if (!stats) return <div className="text-center py-10">İstatistik verileri yüklenemedi.</div>;

  // Badge list definitions
  const badgeDefinitions = [
    { id: 'kasif', name: 'AI Kaşifi', icon: '🥉', range: '0 - 40 Puan', desc: 'Yapay zekâ kavramlarını keşfetmeye başladın.' },
    { id: 'gelistirici', name: 'AI Geliştirici', icon: '🥈', range: '41 - 70 Puan', desc: 'Yapay zekâ etiği ve okuryazarlığında gelişim gösterdin.' },
    { id: 'elci', name: 'AI Elçisi', icon: '🥇', range: '71 - 100 Puan', desc: 'Yapay zekâ etik elçisi olmaya hak kazandın!' }
  ];

  // Custom SVG line chart renderer
  const renderSvgChart = () => {
    const data = stats.chartData || [];
    if (data.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
          Grafik için henüz yeterli veri yok. En az bir quiz çözün.
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const padding = 25;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = 100;
    
    // Generate coordinate points
    const points = data.map((d, i) => {
      const x = padding + (i / Math.max(1, data.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d.percentage / maxVal) * chartHeight;
      return { x, y, label: d.quizTitle, value: d.percentage };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px] overflow-visible">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(15,23,42,0.06)" strokeDasharray="3" />
          <line x1={padding} y1={padding + chartHeight/2} x2={width - padding} y2={padding + chartHeight/2} stroke="rgba(15,23,42,0.06)" strokeDasharray="3" />
          <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="rgba(15,23,42,0.12)" />

          {/* Lines */}
          <path d={linePath} fill="none" stroke="url(#sky-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_4px_8px_rgba(56,189,248,0.3)]" />

          {/* Gradients */}
          <defs>
            <linearGradient id="sky-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Point Circles and tooltips */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#0284c7" strokeWidth="2" className="transition-all duration-200 hover:r-7 hover:fill-sky-500" />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#0284c7" fontSize="8" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity">
                %{p.value}
              </text>
              {/* X Axis Labels */}
              <text x={p.x} y={height - 5} textAnchor="middle" fill="rgba(15,23,42,0.5)" fontSize="7">
                {data[i].date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 mb-1">
            Selam, <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">{user.name}</span>!
          </h1>
          <p className="text-slate-400 text-sm">
            Bugün yapay zekâ okuryazarlığı ve etik kullanım modüllerini inceleyerek başarılarını katla.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActivePage('learn')}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 text-sm transition-all flex items-center gap-1 cursor-pointer"
          >
            Modülleri Oku
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setActivePage('quiz')}
            className="px-4 py-2.5 glass-button text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Quiz Çöz
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Toplam Çözülen Quiz</p>
            <p className="text-3xl font-bold text-slate-100 mt-1">{stats.totalQuizzes}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Son Quiz Puanı</p>
            <p className="text-3xl font-bold text-slate-100 mt-1">
              {stats.totalQuizzes > 0 ? stats.lastQuizScore : '-'}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Genel Başarı Yüzdesi</p>
            <p className="text-3xl font-bold text-slate-100 mt-1">
              {stats.totalQuizzes > 0 ? `%${stats.overallSuccess}` : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Middle: Charts & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <BarChart2 className="text-sky-400" size={20} />
              Gelişim Grafiği (Son 10 Quiz)
            </h3>
            {renderSvgChart()}
          </div>

          {/* History Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Calendar className="text-teal-400" size={20} />
              Çözüm Geçmişi
            </h3>

            {stats.resultsHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Henüz hiçbir quizi tamamlamadınız.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Quiz Başlığı</th>
                      <th className="py-3 px-4 font-semibold text-center">Doğru Sayısı</th>
                      <th className="py-3 px-4 font-semibold text-center">Başarı</th>
                      <th className="py-3 px-4 font-semibold text-center">Rozet</th>
                      <th className="py-3 px-4 font-semibold text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.resultsHistory.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-100">{r.quizTitle}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-sky-400">{r.score}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            r.percentage >= 71 ? 'bg-emerald-500/10 text-emerald-400' :
                            r.percentage >= 41 ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            %{r.percentage}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-xs">
                            <span>{r.badge === 'AI Elçisi' ? '🥇' : r.badge === 'AI Geliştirici' ? '🥈' : '🥉'}</span>
                            <span className="font-medium text-slate-200">{r.badge}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedFeedback({ title: r.quizTitle, text: r.aiFeedback })}
                            className="p-1.5 rounded-lg glass-button text-xs text-sky-300 hover:text-sky-200 flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <MessageSquareCode size={14} />
                            Yorumu Gör
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Badges Display */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 h-full">
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Award className="text-emerald-400" size={20} />
              Kazanılan Rozetler
            </h3>

            <div className="space-y-4">
              {badgeDefinitions.map((badgeDef) => {
                const earned = stats.badges.some(b => b.name === badgeDef.name);

                return (
                  <div
                    key={badgeDef.id}
                    className={`p-4 rounded-xl border transition-all ${
                      earned
                        ? 'bg-gradient-to-br from-white/5 to-sky-500/5 border-sky-500/30 shadow-lg shadow-sky-500/5'
                        : 'bg-white/[0.01] border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                        earned ? 'bg-sky-500/10 border-sky-500/30' : 'bg-white/5 border-white/10'
                      }`}>
                        {badgeDef.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-slate-200">{badgeDef.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            earned ? 'bg-sky-500/20 text-sky-300' : 'bg-white/10 text-slate-400'
                          }`}>
                            {earned ? 'Kazanıldı' : 'Kilitli'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">{badgeDef.range}</p>
                        <p className="text-xs text-slate-300 mt-1 font-light leading-relaxed">
                          {badgeDef.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Feedback Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel border border-white/10 p-6 rounded-2xl shadow-2xl relative animate-scaleUp">
            <h4 className="text-lg font-bold text-sky-400 mb-2 flex items-center gap-2">
              <Compass size={18} />
              AI Rehber Geri Bildirimi
            </h4>
            <p className="text-xs text-slate-400 mb-4 font-semibold uppercase tracking-wider">
              {selectedFeedback.title}
            </p>
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-sm leading-relaxed text-slate-200 font-light italic">
              "{selectedFeedback.text}"
            </div>
            <button
              onClick={() => setSelectedFeedback(null)}
              className="mt-6 w-full py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
