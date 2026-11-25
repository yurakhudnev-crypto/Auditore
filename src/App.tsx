import { useState, useEffect } from 'react';
import TeacherWorkspace from './components/TeacherWorkspace';
import StudentApp from './components/StudentApp';
import ResultsPage from './components/ResultsPage';
import AuthPage from './components/AuthPage';
import TeacherDashboard from './components/TeacherDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type AppMode = 'home' | 'teacher' | 'student' | 'results' | 'auth' | 'dashboard';

function AppContent() {
  const [mode, setMode] = useState<AppMode>('home');
  const [isStudentMode, setIsStudentMode] = useState(false);
  const auth = useAuth();
  
  // Безопасно извлекаем значения из контекста
  const user = auth?.user ?? null;
  const loading = auth?.loading ?? true;

  useEffect(() => {
    // Проверяем оба варианта: ?student и #student
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    
    if (params.has('student') || hash === '#student') {
      setIsStudentMode(true);
      setMode('student');
    }
  }, []);

  // Если пользователь вошёл и находится на странице учителя, показываем дашборд
  useEffect(() => {
    if (user && mode === 'teacher') {
      setMode('dashboard');
    }
  }, [user, mode]);

  if (loading) {
    return (
      <div className="min-h-screen ipod-metal flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">...</div>
          <p className="text-lg font-bold tracking-widest text-[#1A1A1A]">ЗАГРУЗКА...</p>
        </div>
      </div>
    );
  }

  if (isStudentMode) {
    return <StudentApp onBack={() => {}} isStudentOnly={true} />;
  }

  if (mode === 'teacher') {
    return <TeacherWorkspace onBack={() => setMode('home')} />;
  }

  if (mode === 'student') {
    return <StudentApp onBack={() => setMode('home')} />;
  }

  if (mode === 'results') {
    return <ResultsPage onBack={() => setMode('home')} />;
  }

  if (mode === 'auth') {
    return <AuthPage onBack={() => setMode('home')} />;
  }

  if (mode === 'dashboard') {
    return <TeacherDashboard onBack={() => setMode('home')} />;
  }

  return (
    <div className="min-h-screen ipod-metal">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 border-b border-[#B0B0B0] bg-gradient-to-b from-[#F5F5F5] to-[#E8E8E8] shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            AUDITORE
          </h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-xs font-bold tracking-widest text-[#666666]">
                  {user.email}
                </span>
                <button
                  onClick={() => setMode('dashboard')}
                  className="ipod-button rounded-lg px-4 py-2 text-xs font-bold tracking-widest text-white transition-all hover:-translate-y-0.5"
                >
                  КАБИНЕТ
                </button>
              </>
            ) : (
              <button
                onClick={() => setMode('auth')}
                className="ipod-button rounded-lg px-4 py-2 text-xs font-bold tracking-widest text-white transition-all hover:-translate-y-0.5"
              >
                ВОЙТИ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-block rounded-xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] px-4 py-2 shadow-lg">
            <span className="text-sm font-bold tracking-widest text-white">
              SONG LISTENING APP
            </span>
          </div>
          <h2 className="mb-4 text-5xl font-bold tracking-tight text-[#1A1A1A] md:text-6xl">
            Audiotore
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#666666]">
            Song listening app that turns music into a learning adventure
          </p>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#0066CC] to-[#0052A3]"></div>
        </div>

        {/* Role Cards */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {/* Teacher Card */}
          <button
            onClick={() => setMode('teacher')}
            className="group ipod-card p-8 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] shadow-lg">
                <span className="text-2xl font-bold text-white">01</span>
              </div>
              <svg className="h-6 w-6 text-[#B0B0B0] transition-colors group-hover:text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Teacher
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-[#666666]">
              Create listening activities, pick songs, and share them with your class in seconds.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-all group-hover:gap-3">
              PREPARATION
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </button>

          {/* Student Card */}
          <button
            onClick={() => setMode('student')}
            className="group ipod-card p-8 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] shadow-lg">
                <span className="text-2xl font-bold text-white">02</span>
              </div>
              <svg className="h-6 w-6 text-[#B0B0B0] transition-colors group-hover:text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Student
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-[#666666]">
              Listen along, follow the lyrics, and complete fun challenges at your own pace.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-all group-hover:gap-3">
              LISTENING
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </button>

          {/* Results Card */}
          <button
            onClick={() => setMode('results')}
            className="group ipod-card p-8 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] shadow-lg">
                <span className="text-2xl font-bold text-white">03</span>
              </div>
              <svg className="h-6 w-6 text-[#B0B0B0] transition-colors group-hover:text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Results
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-[#666666]">
              Track progress, review scores, and see how the whole class is improving over time.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-all group-hover:gap-3">
              STATISTICS
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </button>
        </div>

        {/* Student Link Section */}
        <div className="ipod-card overflow-hidden">
          <div className="bg-gradient-to-br from-[#0066CC] to-[#0052A3] p-8 sm:p-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Student Link
                </h2>
                <div className="flex items-stretch overflow-hidden rounded-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm">
                  <span className="flex items-center bg-white px-3 font-mono text-xs font-bold tracking-widest text-[#0066CC]">
                    URL
                  </span>
                  <p className="flex min-w-0 flex-1 items-center break-all px-4 py-3 font-mono text-sm text-white sm:text-base">
                    {window.location.origin + window.location.pathname}#student
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const studentLink = `${window.location.origin + window.location.pathname}#student`;
                  navigator.clipboard.writeText(studentLink);
                  alert('Link copied!');
                }}
                className="ipod-button-silver shrink-0 rounded-lg px-7 py-4 text-sm font-bold tracking-widest text-[#1A1A1A] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                COPY
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#B0B0B0] pt-6">
          <div className="flex flex-col items-start gap-2 text-xs font-bold tracking-widest text-[#666666] sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} AUDITORE</span>
            <span className="text-[#0066CC]">LEARN BY LISTENING</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
