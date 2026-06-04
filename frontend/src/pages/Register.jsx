import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle, School, Hash } from 'lucide-react';

export default function Register({ setActivePage }) {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [className, setClassName] = useState('');
  const [schoolNumber, setSchoolNumber] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== passwordConfirm) {
      setError('Şifreler uyuşmuyor.');
      return;
    }

    if (password.length < 6) {
      setError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        passwordConfirm,
        className,
        schoolNumber
      });
      setActivePage('dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[110px] pointer-events-none pulse-glow"></div>

      <div className="w-full max-w-lg glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
            Öğrenci Kayıt Paneli
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Yapay zekâyı doğru, güvenli ve etik kullanmayı keşfetmek için hesabını oluştur!
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-lg mb-6">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ad Soyad */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Ad Soyad
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Sınıf */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Sınıf (Örn: 10-A)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <School size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="10-B"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Okul Numarası */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Okul Numarası
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Hash size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={schoolNumber}
                  onChange={(e) => setSchoolNumber(e.target.value)}
                  placeholder="742"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* E-posta */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                E-posta Adresi
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmet@okul.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Şifre Tekrar */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Şifre Tekrar
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-emerald-500 hover:brightness-110 disabled:brightness-75 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <UserPlus size={18} />
                Kayıt Ol ve Giriş Yap
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center mt-6 pt-6 border-t border-white/5">
          <p className="text-sm text-slate-400">
            Zaten hesabın var mı?{' '}
            <button
              onClick={() => setActivePage('login')}
              className="text-sky-400 hover:text-sky-300 hover:underline font-semibold"
            >
              Giriş Yap
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
