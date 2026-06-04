import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import LearnModules from './pages/LearnModules';
import AiGuide from './pages/AiGuide';
import ScenarioCenter from './pages/ScenarioCenter';
import SmartQuiz from './pages/SmartQuiz';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminQuizzes from './pages/AdminQuizzes';

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('landing');
  const [adminQuizView, setAdminQuizView] = useState('list');

  // Handle active page routing on login state changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'admin') {
          setActivePage('admin-dashboard');
        } else {
          setActivePage('dashboard');
        }
      } else {
        if (['dashboard', 'learn', 'guide', 'quiz', 'scenarios', 'admin-dashboard', 'admin-students', 'admin-quizzes'].includes(activePage)) {
          setActivePage('landing');
        }
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <span className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'landing':
        return <Landing setActivePage={setActivePage} />;
      case 'login':
        return <Login setActivePage={setActivePage} />;
      case 'register':
        return <Register setActivePage={setActivePage} />;
      
      // Student Views
      case 'dashboard':
        return user?.role === 'student' ? <StudentDashboard setActivePage={setActivePage} /> : <Login setActivePage={setActivePage} />;
      case 'learn':
        return user?.role === 'student' ? <LearnModules /> : <Login setActivePage={setActivePage} />;
      case 'guide':
        return user?.role === 'student' ? <AiGuide /> : <Login setActivePage={setActivePage} />;
      case 'quiz':
        return user?.role === 'student' ? <SmartQuiz /> : <Login setActivePage={setActivePage} />;
      case 'scenarios':
        return user?.role === 'student' ? <ScenarioCenter /> : <Login setActivePage={setActivePage} />;
      
      // Admin Views
      case 'admin-dashboard':
        return user?.role === 'admin' ? <AdminDashboard setActivePage={setActivePage} setAdminQuizView={setAdminQuizView} /> : <Login setActivePage={setActivePage} />;
      case 'admin-students':
        return user?.role === 'admin' ? <AdminUsers /> : <Login setActivePage={setActivePage} />;
      case 'admin-quizzes':
        return user?.role === 'admin' ? <AdminQuizzes view={adminQuizView} setView={setAdminQuizView} /> : <Login setActivePage={setActivePage} />;
      
      default:
        return <Landing setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar activePage={activePage} setActivePage={setActivePage} />
        <main className="pb-16">{renderPage()}</main>
      </div>
      
      {/* Footer */}
      <footer className="w-full glass-panel border-t border-white/5 py-6 text-center text-xs text-slate-500 relative z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} AI Navigator. Tüm Hakları Saklıdır.</p>
          <p className="mt-1 text-[10px] text-slate-600">
            Lise öğrencileri için yapay zekâ okuryazarlığı, etik kullanımı ve veri güvenliği eğitim portalı.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
