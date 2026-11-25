import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Song, Result, ClassLink } from '../types/supabase';

interface Props {
  onBack: () => void;
}

export default function TeacherDashboard({ onBack }: Props) {
  const { teacher, signOut } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [classLinks, setClassLinks] = useState<ClassLink[]>([]);
  const [activeTab, setActiveTab] = useState<'songs' | 'results' | 'links'>('songs');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacher) {
      loadTeacherData();
    }
  }, [teacher]);

  const loadTeacherData = async () => {
    if (!teacher) return;

    // Загружаем песни учителя
    const { data: songsData } = await supabase
      .from('songs')
      .select('*')
      .eq('teacher_id', teacher.id)
      .order('created_at', { ascending: false });

    if (songsData) setSongs(songsData);

    // Загружаем результаты учеников учителя
    const { data: resultsData } = await supabase
      .from('results')
      .select(`
        *,
        students:first_name, last_name, class_name,
        songs:title, artist
      `)
      .in('student_id', (await supabase
        .from('students')
        .select('id')
        .eq('teacher_id', teacher.id)
      ).data?.map(s => s.id) || []);

    if (resultsData) setResults(resultsData);

    // Загружаем ссылки на классы
    const { data: linksData } = await supabase
      .from('class_links')
      .select('*')
      .eq('teacher_id', teacher.id)
      .order('created_at', { ascending: false });

    if (linksData) setClassLinks(linksData);

    setLoading(false);
  };

  const generateClassLink = async () => {
    if (!teacher) return;

    const className = prompt('Введите название класса (например, 8А):');
    if (!className) return;

    const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from('class_links')
      .insert([{
        teacher_id: teacher.id,
        link_code: linkCode,
        class_name: className
      }])
      .select()
      .single();

    if (error) {
      alert('Ошибка создания ссылки: ' + error.message);
    } else if (data) {
      setClassLinks([data, ...classLinks]);
      const fullLink = `${window.location.origin}/join/${linkCode}`;
      alert(`Ссылка создана!\n\n${fullLink}\n\nОтправьте эту ссылку ученикам класса ${className}`);
    }
  };

  const deleteSong = async (songId: string) => {
    if (!confirm('Удалить эту песню?')) return;

    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (error) {
      alert('Ошибка удаления: ' + error.message);
    } else {
      setSongs(songs.filter(s => s.id !== songId));
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!confirm('Удалить эту ссылку?')) return;

    const { error } = await supabase
      .from('class_links')
      .delete()
      .eq('id', linkId);

    if (error) {
      alert('Ошибка удаления: ' + error.message);
    } else {
      setClassLinks(classLinks.filter(l => l.id !== linkId));
    }
  };

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

  return (
    <div className="min-h-screen ipod-metal">
      <div className="sticky top-0 z-50 border-b border-[#B0B0B0] bg-gradient-to-b from-[#F5F5F5] to-[#E8E8E8] shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-colors hover:text-[#0052A3]">
              <span className="transition-transform">←</span>
              BACK
            </button>
            <div className="h-6 w-px bg-[#B0B0B0]"></div>
            <h1 className="text-lg font-bold tracking-tight text-[#1A1A1A]">
              TEACHER <span className="text-[#0066CC]">DASHBOARD</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold tracking-widest text-[#666666]">
              {teacher?.email}
            </span>
            <button
              onClick={signOut}
              className="rounded-lg border-2 border-[#dc2626] px-4 py-2 text-xs font-bold tracking-widest text-[#dc2626] transition-all hover:bg-[#dc2626] hover:text-white"
            >
              ВЫХОД
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Табы */}
        <div className="mb-8 flex gap-2">
          <button
            onClick={() => setActiveTab('songs')}
            className={`rounded-lg px-6 py-3 text-sm font-bold tracking-widest transition-all ${
              activeTab === 'songs'
                ? 'ipod-button text-white'
                : 'ipod-button-silver text-[#1A1A1A]'
            }`}
          >
            МОИ ПЕСНИ ({songs.length})
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`rounded-lg px-6 py-3 text-sm font-bold tracking-widest transition-all ${
              activeTab === 'results'
                ? 'ipod-button text-white'
                : 'ipod-button-silver text-[#1A1A1A]'
            }`}
          >
            РЕЗУЛЬТАТЫ ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`rounded-lg px-6 py-3 text-sm font-bold tracking-widest transition-all ${
              activeTab === 'links'
                ? 'ipod-button text-white'
                : 'ipod-button-silver text-[#1A1A1A]'
            }`}
          >
            ССЫЛКИ ({classLinks.length})
          </button>
        </div>

        {/* Контент табов */}
        {activeTab === 'songs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Мои песни</h2>
              <button
                onClick={() => alert('Функция создания песни будет добавлена позже')}
                className="ipod-button rounded-lg px-6 py-3 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5"
              >
                + ДОБАВИТЬ ПЕСНЮ
              </button>
            </div>

            {songs.length === 0 ? (
              <div className="ipod-card p-8 text-center">
                <p className="text-[#666666]">У вас пока нет песен. Нажмите "ДОБАВИТЬ ПЕСНЮ" чтобы создать первую.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {songs.map(song => (
                  <div key={song.id} className="ipod-card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {song.cover_url && (
                          <img src={song.cover_url} alt={song.title} className="h-16 w-16 rounded-lg object-cover" />
                        )}
                        <div>
                          <h3 className="text-lg font-bold tracking-tight text-[#1A1A1A]">{song.title}</h3>
                          <p className="text-sm text-[#666666]">{song.artist}</p>
                          <div className="mt-2 flex gap-2">
                            <span className="rounded-full bg-[#0066CC]/10 px-3 py-1 text-xs font-bold tracking-widest text-[#0066CC]">
                              {song.difficulty.toUpperCase()}
                            </span>
                            {song.tags?.slice(0, 3).map((tag, i) => (
                              <span key={i} className="rounded-full bg-[#F5F5F5] px-3 py-1 text-xs text-[#666666]">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSong(song.id)}
                        className="rounded-lg border-2 border-[#dc2626] px-4 py-2 text-xs font-bold tracking-widest text-[#dc2626] transition-all hover:bg-[#dc2626] hover:text-white"
                      >
                        УДАЛИТЬ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Результаты учеников</h2>

            {results.length === 0 ? (
              <div className="ipod-card p-8 text-center">
                <p className="text-[#666666]">Пока нет результатов. Ученики ещё не выполняли упражнения.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {results.map(result => (
                  <div key={result.id} className="ipod-card p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-[#1A1A1A]">
                          {result.students?.last_name} {result.students?.first_name}
                        </h3>
                        <p className="text-sm text-[#666666]">
                          Класс: {result.students?.class_name} | Песня: {result.songs?.title}
                        </p>
                        <p className="mt-1 text-xs text-[#B0B0B0]">
                          {new Date(result.completed_at).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold tracking-tight text-[#0066CC]">
                          {Math.round((result.correct_gaps / result.total_gaps) * 100)}%
                        </p>
                        <p className="text-xs font-bold tracking-widest text-[#666666]">
                          {result.correct_gaps}/{result.total_gaps}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Ссылки для учеников</h2>
              <button
                onClick={generateClassLink}
                className="ipod-button rounded-lg px-6 py-3 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5"
              >
                + СОЗДАТЬ ССЫЛКУ
              </button>
            </div>

            {classLinks.length === 0 ? (
              <div className="ipod-card p-8 text-center">
                <p className="text-[#666666]">У вас пока нет ссылок. Нажмите "СОЗДАТЬ ССЫЛКУ" для создания ссылки для класса.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {classLinks.map(link => (
                  <div key={link.id} className="ipod-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Класс {link.class_name}</h3>
                        <p className="mt-1 text-sm text-[#666666]">
                          Код: <code className="rounded bg-[#F5F5F5] px-2 py-1 font-mono">{link.link_code}</code>
                        </p>
                        <p className="mt-2 text-xs text-[#B0B0B0]">
                          Ссылка: {window.location.origin}/join/{link.link_code}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="rounded-lg border-2 border-[#dc2626] px-4 py-2 text-xs font-bold tracking-widest text-[#dc2626] transition-all hover:bg-[#dc2626] hover:text-white"
                      >
                        УДАЛИТЬ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
