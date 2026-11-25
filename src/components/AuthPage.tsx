import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onBack: () => void;
}

export default function AuthPage({ onBack }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message === 'Invalid login credentials' 
          ? 'Неверный email или пароль' 
          : error.message);
      }
    } else {
      if (!name.trim()) {
        setError('Пожалуйста, введите ваше имя');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error.message);
      } else {
        setError('');
        alert('Регистрация успешна! Проверьте email для подтверждения.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen ipod-metal">
      <div className="sticky top-0 z-50 border-b border-[#B0B0B0] bg-gradient-to-b from-[#F5F5F5] to-[#E8E8E8] shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-colors hover:text-[#0052A3]">
            <span className="transition-transform">←</span>
            BACK
          </button>
          <div className="h-6 w-px bg-[#B0B0B0]"></div>
          <h1 className="text-lg font-bold tracking-tight text-[#1A1A1A]">
            TEACHER <span className="text-[#0066CC]">AUTHENTICATION</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 py-12">
        <div className="ipod-card p-8">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-[#1A1A1A]">
            {isLogin ? 'Вход для учителей' : 'Регистрация'}
          </h2>
          <p className="mb-8 text-sm text-[#666666]">
            {isLogin 
              ? 'Войдите в свой аккаунт для управления песнями и просмотра результатов'
              : 'Создайте аккаунт для управления песнями и учениками'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-2 block text-xs font-bold tracking-widest text-[#666666]">
                  ИМЯ
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="ipod-input w-full rounded-lg px-4 py-3 text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#666666]">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="teacher@example.com"
                className="ipod-input w-full rounded-lg px-4 py-3 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest text-[#666666]">
                ПАРОЛЬ
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="ipod-input w-full rounded-lg px-4 py-3 text-sm"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="rounded-lg border-2 border-[#dc2626] bg-[#dc2626]/10 p-4">
                <p className="text-xs font-bold tracking-widest text-[#dc2626]">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ipod-button w-full rounded-lg py-4 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed"
            >
              {loading ? 'ЗАГРУЗКА...' : isLogin ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm font-bold tracking-widest text-[#0066CC] hover:underline"
            >
              {isLogin ? 'НЕТ АККАУНТА? ЗАРЕГИСТРИРОВАТЬСЯ' : 'УЖЕ ЕСТЬ АККАУНТ? ВОЙТИ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
