import { useState, useEffect } from 'react';
import SongSelector from './SongSelector';
import StudentListening from './StudentListening';
import StudentTranslation from './StudentTranslation';
import ComparisonPage from './ComparisonPage';
import { loadConfig } from '../utils/config';

interface Props {
  onBack: () => void;
  isStudentOnly?: boolean;
}

type StudentStep = 'info' | 'select' | 'listening' | 'translation' | 'comparison' | 'done';

const StudentApp = ({ onBack, isStudentOnly = false }: Props) => {
  const [step, setStep] = useState<StudentStep>('info');
  const [studentInfo, setStudentInfo] = useState({ firstName: '', lastName: '', className: '' });
  const [songFile, setSongFile] = useState<any>(null);
  const [gapAnswers, setGapAnswers] = useState<any[]>([]);
  const [translations, setTranslations] = useState<any[]>([]);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentInfo.firstName && studentInfo.lastName && studentInfo.className) {
      setStep('select');
    }
  };

  const handleSongSelected = (file: any) => {
    setSongFile(file);
    setStep('listening');
  };

  const handleListeningComplete = (answers: any[]) => {
    setGapAnswers(answers);
    setStep('translation');
  };

  const handleTranslationComplete = (trans: any[]) => {
    setTranslations(trans);
    setStep('comparison');
  };

  const handleComparisonComplete = () => {
    setStep('done');
  };

  const handleSubmit = () => {
    const result = {
      studentInfo,
      songTitle: songFile.title,
      date: new Date().toISOString(),
      gapAnswers,
      translations,
      totalGaps: gapAnswers.length,
      correctGaps: gapAnswers.filter(a => a.isCorrect).length,
    };

    // Сохраняем локально с обработкой ошибок
    try {
      const saved = JSON.parse(localStorage.getItem('listenup_results') || '[]');
      saved.push(result);
      localStorage.setItem('listenup_results', JSON.stringify(saved));
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
    
    setSubmitStatus('success');
  };

  const handleSubmitToGoogleForm = async () => {
    // Загружаем конфигурацию из файла
    const config = await loadConfig();
    const formUrl = config.googleForm.url;
    const formEntryIds = config.googleForm.entryIds;

    // Если форма не настроена, показываем ошибку
    if (!formUrl) {
      setSubmitStatus('error');
      return;
    }

    const correctGaps = gapAnswers.filter(a => a.isCorrect).length;
    const totalGaps = gapAnswers.length;
    const percentage = totalGaps > 0 ? Math.round((correctGaps / totalGaps) * 100) : 0;
    
    const translationsText = translations
      .map(t => `Line ${t.lineIndex + 1}: ${t.text}`)
      .join('\n');

    // Функция для нормализации Entry ID (убирает "entry." если есть)
    const normalizeEntryId = (id: string) => {
      if (!id) return '';
      return id.replace(/^entry\./, '');
    };

    // Очищаем URL формы от лишних параметров
    const cleanFormUrl = formUrl.split('?')[0];

    // Создаём URL с предзаполненными данными
    const params = new URLSearchParams();
    if (formEntryIds.firstName) params.append(`entry.${normalizeEntryId(formEntryIds.firstName)}`, studentInfo.firstName);
    if (formEntryIds.lastName) params.append(`entry.${normalizeEntryId(formEntryIds.lastName)}`, studentInfo.lastName);
    if (formEntryIds.className) params.append(`entry.${normalizeEntryId(formEntryIds.className)}`, studentInfo.className);
    if (formEntryIds.songTitle) params.append(`entry.${normalizeEntryId(formEntryIds.songTitle)}`, songFile?.title || '');
    if (formEntryIds.score) params.append(`entry.${normalizeEntryId(formEntryIds.score)}`, `${correctGaps}/${totalGaps}`);
    if (formEntryIds.totalGaps) params.append(`entry.${normalizeEntryId(formEntryIds.totalGaps)}`, totalGaps.toString());
    if (formEntryIds.percentage) params.append(`entry.${normalizeEntryId(formEntryIds.percentage)}`, `${percentage}%`);
    if (formEntryIds.translations) params.append(`entry.${normalizeEntryId(formEntryIds.translations)}`, translationsText);

    const fullUrl = `${cleanFormUrl}?${params.toString()}`;
    
    // Используем <a> тег вместо window.open для мобильной совместимости
    const link = document.createElement('a');
    link.href = fullUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Также сохраняем локально
    handleSubmit();
  };

  return (
    <div className="min-h-screen ipod-metal">
      <div className="sticky top-0 z-50 border-b border-[#B0B0B0] bg-gradient-to-b from-[#F5F5F5] to-[#E8E8E8] shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          {!isStudentOnly && (
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-colors hover:text-[#0052A3]">
              <span className="transition-transform">←</span>
              BACK
            </button>
          )}
          {!isStudentOnly && <div className="h-6 w-px bg-[#B0B0B0]"></div>}
          <h1 className="text-lg font-bold tracking-tight text-[#1A1A1A]">
            AUDI<span className="text-[#0066CC]">TORE</span>
          </h1>
          {step !== 'info' && step !== 'select' && (
            <div className="ml-auto rounded-lg border border-[#B0B0B0] bg-white px-4 py-2">
              <span className="text-xs font-bold tracking-widest text-[#666666]">
                {studentInfo.firstName} {studentInfo.lastName}, {studentInfo.className}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {step === 'info' && (
          <div className="mx-auto w-full max-w-md">
            <div className="ipod-card p-8">
              <h2 className="mb-2 text-xl font-bold text-[#1A1A1A]">
                Welcome to Audiotore
              </h2>
              <p className="mb-8 max-w-sm text-sm text-[#666666]">
                Please enter your information to start the listening exercise
              </p>

              <form onSubmit={handleInfoSubmit}>
                <div className="mb-4 flex flex-col gap-4 md:flex-row">
                  <div className="flex min-w-0 flex-1 flex-col space-y-2">
                    <label className="text-xs font-bold tracking-widest text-[#666666]">FIRST NAME</label>
                    <input
                      type="text"
                      placeholder="John"
                      value={studentInfo.firstName}
                      onChange={e => setStudentInfo({ ...studentInfo, firstName: e.target.value })}
                      className="ipod-input w-full rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col space-y-2">
                    <label className="text-xs font-bold tracking-widest text-[#666666]">LAST NAME</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={studentInfo.lastName}
                      onChange={e => setStudentInfo({ ...studentInfo, lastName: e.target.value })}
                      className="ipod-input w-full rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div className="mb-8 flex w-full flex-col space-y-2">
                  <label className="text-xs font-bold tracking-widest text-[#666666]">CLASS</label>
                  <input
                    type="text"
                    placeholder="8A"
                    value={studentInfo.className}
                    onChange={e => setStudentInfo({ ...studentInfo, className: e.target.value })}
                    className="ipod-input rounded-lg px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!studentInfo.firstName || !studentInfo.lastName || !studentInfo.className}
                  className="ipod-button w-full rounded-lg py-3 font-bold tracking-widest text-white transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed"
                >
                  CONTINUE →
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 'select' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#1A1A1A]">
                CHOOSE A SONG
              </h2>
              <p className="text-[#666666]">Select a song from the catalog or upload your own file</p>
              <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#0066CC] to-[#0052A3]"></div>
            </div>
            <SongSelector onSelectSong={handleSongSelected} />
          </div>
        )}

        {step === 'listening' && songFile && (
          <StudentListening songFile={songFile} onComplete={handleListeningComplete} />
        )}

        {step === 'translation' && songFile && (
          <StudentTranslation songFile={songFile} onComplete={handleTranslationComplete} />
        )}

        {step === 'comparison' && songFile && (
          <ComparisonPage songFile={songFile} translations={translations} onComplete={handleComparisonComplete} />
        )}

        {step === 'done' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-4 text-5xl font-bold tracking-tight text-[#1A1A1A]">
                WELL DONE!
              </h2>
              <p className="text-lg text-[#666666]">You have completed the exercise</p>
              <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#0066CC] to-[#0052A3]"></div>
            </div>

            <div className="ipod-card p-6 sm:p-8 space-y-4">
              <h3 className="mb-6 text-xl font-bold tracking-tight text-[#1A1A1A]">
                RESULTS:
              </h3>
              <div className="flex items-center justify-between border-b-2 border-[#E0E0E0] py-3">
                <span className="text-xs font-bold tracking-widest text-[#666666]">SONG:</span>
                <span className="text-base font-bold text-[#1A1A1A]">{songFile?.title}</span>
              </div>
              <div className="flex items-center justify-between border-b-2 border-[#E0E0E0] py-3">
                <span className="text-xs font-bold tracking-widest text-[#666666]">CORRECT ANSWERS:</span>
                <span className="text-base font-bold text-[#0066CC]">
                  {gapAnswers.filter(a => a.isCorrect).length} / {gapAnswers.length}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-bold tracking-widest text-[#666666]">TRANSLATIONS COMPLETED:</span>
                <span className="text-base font-bold text-[#1A1A1A]">
                  {translations.filter(t => t.text.trim()).length} / {songFile?.lines.length}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmitToGoogleForm}
              disabled={submitStatus === 'success'}
              className="ipod-button w-full rounded-lg py-4 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed"
            >
              {submitStatus === 'success' ? 'SAVED!' : 'SEND TO TEACHER'}
            </button>

            {submitStatus === 'success' && (
              <div className="rounded-lg border-2 border-[#0066CC] bg-[#0066CC]/10 p-4 text-center">
                <p className="text-xs font-bold tracking-widest text-[#0066CC]">
                  RESULTS SENT TO TEACHER!
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="rounded-lg border-2 border-[#dc2626] bg-[#dc2626]/10 p-4 text-center">
                <p className="text-xs font-bold tracking-widest text-[#dc2626]">
                  FORM NOT CONFIGURED. PLEASE ASK YOUR TEACHER TO SET UP THE FORM.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentApp;
