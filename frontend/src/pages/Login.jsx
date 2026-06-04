import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login({ setActivePage }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.user.role === 'admin') {
        setActivePage('admin-dashboard');
      } else {
        setActivePage('dashboard');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none pulse-glow"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
            Tekrar Hoş Geldin!
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            AI Navigator ile öğrenmeye ve kendini test etmeye devam et.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-lg mb-6 animate-shake">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
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
                placeholder="ogrenci@okul.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
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
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-emerald-500 hover:brightness-110 disabled:brightness-75 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-8 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn size={18} />
                Giriş Yap
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center mt-6 pt-6 border-t border-white/5">
          <p className="text-sm text-slate-400">
            Hesabın yok mu?{' '}
            <button
              onClick={() => setActivePage('register')}
              className="text-sky-400 hover:text-sky-300 hover:underline font-semibold"
            >
              Yeni Hesap Oluştur
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
