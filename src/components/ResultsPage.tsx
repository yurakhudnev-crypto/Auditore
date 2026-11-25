import { useState } from 'react';

interface Props {
  onBack: () => void;
}

const ResultsPage = ({ onBack }: Props) => {
  const [results, setResults] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('listenup_results') || '[]');
    } catch {
      return [];
    }
  });

  const handleClearResults = () => {
    if (confirm('Delete all results?')) {
      localStorage.removeItem('listenup_results');
      setResults([]);
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;
    
    const headers = ['Date', 'First Name', 'Last Name', 'Class', 'Song', 'Correct', 'Total Gaps', 'Percentage'];
    const rows = results.map(r => [
      new Date(r.date).toLocaleDateString('ru'),
      r.studentInfo.firstName,
      r.studentInfo.lastName,
      r.studentInfo.className,
      r.songTitle,
      r.correctGaps,
      r.totalGaps,
      `${Math.round((r.correctGaps / r.totalGaps) * 100)}%`,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `listenup_results_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            STUDENT <span className="text-[#0066CC]">RESULTS</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
        {results.length === 0 ? (
          <div className="ipod-card p-8 text-center">
            <p className="text-lg font-bold tracking-widest text-[#666666]">
              NO RESULTS YET
            </p>
            <p className="mt-2 text-sm text-[#B0B0B0]">
              Results will appear here after students complete exercises
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleExportCSV}
                className="ipod-button rounded-lg px-6 py-3 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5"
              >
                EXPORT TO CSV
              </button>
              <button
                onClick={handleClearResults}
                className="ipod-button-silver rounded-lg px-6 py-3 text-sm font-bold tracking-widest text-[#1A1A1A] transition-all hover:-translate-y-0.5 hover:bg-[#0066CC] hover:text-white hover:border-[#0066CC]"
              >
                CLEAR
              </button>
            </div>

            <div className="space-y-4">
              {results.map((result, i) => (
                <div key={i} className="ipod-card p-6 sm:p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                        {result.studentInfo.lastName} {result.studentInfo.firstName}
                      </p>
                      <p className="mt-2 text-xs font-bold tracking-widest text-[#666666]">
                        CLASS: {result.studentInfo.className} | {result.songTitle}
                      </p>
                      <p className="mt-1 text-xs font-bold tracking-widest text-[#B0B0B0]">
                        {new Date(result.date).toLocaleString('ru')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-bold tracking-tight text-[#0066CC]">
                        {Math.round((result.correctGaps / result.totalGaps) * 100)}%
                      </p>
                      <p className="mt-1 text-xs font-bold tracking-widest text-[#666666]">
                        {result.correctGaps}/{result.totalGaps}
                      </p>
                    </div>
                  </div>

                  {result.translations && result.translations.length > 0 && (
                    <details className="mt-6">
                      <summary className="cursor-pointer text-xs font-bold tracking-widest text-[#0066CC] hover:underline">
                        SHOW TRANSLATIONS
                      </summary>
                      <div className="mt-4 space-y-2">
                        {result.translations.map((t: any, j: number) => (
                          <p key={j} className="rounded-lg border-2 border-[#1A1A1A] bg-[#F5F5F5] px-4 py-2 text-xs font-bold tracking-widest text-[#666666]">
                            LINE {t.lineIndex + 1}: {t.text || '(EMPTY)'}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
