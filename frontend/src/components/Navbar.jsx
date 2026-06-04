import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Compass, LogOut, LayoutDashboard, BookOpen, MessageSquare, Award, ClipboardCheck, Users, BrainCircuit } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const renderNavLinks = () => {
    if (!user) return null;

    if (user.role === 'admin') {
      return (
        <>
          <button
            onClick={() => handleNavClick('admin-dashboard')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activePage === 'admin-dashboard'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard size={16} />
            Yönetim Paneli
          </button>
          <button
            onClick={() => handleNavClick('admin-students')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activePage === 'admin-students'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={16} />
            Öğrenci Yönetimi
          </button>
          <button
            onClick={() => handleNavClick('admin-quizzes')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activePage === 'admin-quizzes'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ClipboardCheck size={16} />
            Quiz Yönetimi
          </button>
        </>
      );
    }

    // Student Links
    return (
      <>
        <button
          onClick={() => handleNavClick('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            activePage === 'dashboard'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard size={16} />
          Panelim
        </button>
        <button
          onClick={() => handleNavClick('learn')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            activePage === 'learn'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen size={16} />
          Modüller
        </button>
        <button
          onClick={() => handleNavClick('guide')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            activePage === 'guide'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare size={16} />
          AI Rehber
        </button>
        <button
          onClick={() => handleNavClick('quiz')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            activePage === 'quiz'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Award size={16} />
          Akıllı Quiz
        </button>
        <button
          onClick={() => handleNavClick('scenarios')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            activePage === 'scenarios'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <BrainCircuit size={16} />
          Senaryo Merkezi
        </button>
      </>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick(user ? (user.role === 'admin' ? 'admin-dashboard' : 'dashboard') : 'landing')}>
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-sky-500 to-emerald-400 text-slate-900 font-bold">
              <Compass size={20} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent tracking-wide">
              AI Navigator
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {renderNavLinks()}
          </div>

          {/* User Section (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">
                    {user.role === 'admin' ? 'Öğretmen / Admin' : `${user.className} • No: ${user.schoolNumber}`}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Güvenli Çıkış"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="px-4 py-2 text-sm font-medium text-slate-900 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-lg hover:brightness-110 transition-all font-semibold"
                >
                  Kayıt Ol
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-2 pt-2 pb-4 space-y-1 sm:px-3">
          {renderNavLinks()}
          {user ? (
            <div className="pt-4 pb-2 border-t border-white/10 mt-3 px-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">
                  {user.role === 'admin' ? 'Öğretmen / Admin' : `${user.className} • No: ${user.schoolNumber}`}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={16} />
                Çıkış Yap
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-white/10 mt-3 flex flex-col gap-2 px-3">
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-2 text-center text-sm font-medium text-slate-300 hover:text-white border border-white/10 rounded-lg"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="w-full py-2 text-center text-sm font-medium text-slate-900 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-lg font-semibold"
              >
                Kayıt Ol
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
