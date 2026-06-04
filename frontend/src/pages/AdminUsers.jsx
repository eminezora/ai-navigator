import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, Trash2, Eye, X, AlertCircle, Calendar, MessageSquare, Compass, ShieldAlert, Award } from 'lucide-react';

export default function AdminUsers() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Add Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [className, setClassName] = useState('');
  const [schoolNumber, setSchoolNumber] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [searchTerm]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/users/students?search=${searchTerm}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = async (student) => {
    setSelectedStudent(student);
    setDetailsLoading(true);
    try {
      const response = await axios.get(`/api/users/students/${student.id}`);
      setStudentDetails(response.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      await axios.post('/api/users/students', {
        name,
        email,
        password,
        className,
        schoolNumber
      });
      setShowAddModal(false);
      // Clear fields
      setName('');
      setEmail('');
      setClassName('');
      setSchoolNumber('');
      setPassword('');
      fetchStudents();
    } catch (error) {
      setFormError(error.response?.data?.error || 'Öğrenci oluşturulurken bir hata oluştu.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Bu öğrenciyi ve tüm sınav sonuçlarını silmek istediğinizden emin misiniz?')) return;

    try {
      await axios.delete(`/api/users/students/${id}`);
      fetchStudents();
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
        setStudentDetails(null);
      }
    } catch (error) {
      alert('Öğrenci silinirken hata oluştu.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="text-sky-400" />
            Öğrenci Yönetimi
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Öğrenci hesaplarını ekleyin, silin ve çözdükleri quizlerin detaylı sonuçlarını inceleyin.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-955 font-bold rounded-xl shadow-lg shadow-sky-500/20 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <UserPlus size={16} />
          Yeni Öğrenci Ekle
        </button>
      </div>

      {/* Filter and search */}
      <div className="relative max-w-md mb-6">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="İsim, e-posta, sınıf veya okul no ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
        />
      </div>

      {/* Student List Grid */}
      {loading ? (
        <div className="text-center py-10">
          <span className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin inline-block"></span>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 text-slate-500 glass-panel p-8 rounded-2xl border-white/5">
          Öğrenci bulunamadı.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-6 font-semibold">Ad Soyad</th>
                  <th className="py-3 px-6 font-semibold">Sınıf</th>
                  <th className="py-3 px-6 font-semibold text-center">Okul No</th>
                  <th className="py-3 px-6 font-semibold">E-posta</th>
                  <th className="py-3 px-6 font-semibold text-center">Çözülen Quiz</th>
                  <th className="py-3 px-6 font-semibold text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.01] transition-all">
                    <td className="py-3.5 px-6 font-medium text-slate-100">{student.name}</td>
                    <td className="py-3.5 px-6 text-slate-400 font-bold uppercase">{student.className || '-'}</td>
                    <td className="py-3.5 px-6 text-center text-slate-300 font-bold">{student.schoolNumber || '-'}</td>
                    <td className="py-3.5 px-6 text-slate-300 text-xs font-light">{student.email}</td>
                    <td className="py-3.5 px-6 text-center font-bold text-sky-400">{student._count.quizResults}</td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleShowDetails(student)}
                        className="p-1.5 rounded-lg glass-button text-xs text-sky-300 cursor-pointer inline-flex items-center gap-1"
                        title="Detaylı Rapor"
                      >
                        <Eye size={14} />
                        Detaylar
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer inline-flex items-center"
                        title="Öğrenciyi Sil"
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

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-slate-100 mb-6">Yeni Öğrenci Ekle</h3>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-lg mb-4">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Can Demir"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sınıf</label>
                  <input
                    type="text"
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="9-B"
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Okul No</label>
                  <input
                    type="text"
                    required
                    value={schoolNumber}
                    onChange={(e) => setSchoolNumber(e.target.value)}
                    placeholder="1045"
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">E-posta</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="can@okul.com"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Şifre</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {formSubmitting ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Kaydet ve Ekle'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT HISTORY / DETAILS INSPECTOR MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-3xl glass-panel border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scaleUp">
            <button
              onClick={() => {
                setSelectedStudent(null);
                setStudentDetails(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="border-b border-white/10 pb-4 mb-6">
              <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10">
                {selectedStudent.className || 'Belirtilmemiş'} • Okul No: {selectedStudent.schoolNumber || '-'}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-2">{selectedStudent.name}</h3>
              <p className="text-slate-400 text-xs mt-1">{selectedStudent.email}</p>
            </div>

            {detailsLoading ? (
              <div className="text-center py-10">
                <span className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin inline-block"></span>
              </div>
            ) : !studentDetails || studentDetails.quizResults.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Öğrenciye ait henüz kayıtlı quiz sonucu bulunmuyor.
              </div>
            ) : (
              <div className="space-y-6">
                <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wide">Quiz Sonuç Geçmişi</h4>
                <div className="space-y-4">
                  {studentDetails.quizResults.map((res) => (
                    <div key={res.id} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                        <div>
                          <h5 className="font-bold text-slate-100 text-sm">{res.quiz.title}</h5>
                          <span className="text-[10px] text-slate-400 inline-flex items-center gap-1 mt-0.5">
                            <Calendar size={10} />
                            {new Date(res.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                            Doğru: {res.score}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Başarı: %{res.percentage}
                          </span>
                          <span className="text-xs inline-flex items-center gap-0.5">
                            <span>{res.badge === 'AI Elçisi' ? '🥇' : res.badge === 'AI Geliştirici' ? '🥈' : '🥉'}</span>
                            <span className="font-semibold text-slate-200 text-[10px]">{res.badge}</span>
                          </span>
                        </div>
                      </div>

                      {/* AI Feedback */}
                      {res.aiFeedback && (
                        <div className="p-3 bg-sky-500/[0.02] border border-sky-500/10 rounded-lg text-xs leading-relaxed text-slate-300 font-light flex gap-2">
                          <Compass size={14} className="shrink-0 text-sky-400 mt-0.5 animate-pulse" />
                          <div>
                            <span className="font-semibold text-sky-300">Yapay Zekâ Yorumu: </span>
                            "{res.aiFeedback}"
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
