import { useState } from 'react';

interface Props {
  songFile: any;
  onComplete: (translations: any[]) => void;
}

interface WordTooltip {
  word: string;
  translation: string;
  x: number;
  y: number;
}

const StudentTranslation = ({ songFile, onComplete }: Props) => {
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [tooltip, setTooltip] = useState<WordTooltip | null>(null);

  const handleTranslationChange = (lineIndex: number, text: string) => {
    setTranslations({ ...translations, [lineIndex]: text });
  };

  const handleWordClick = (e: React.MouseEvent, word: string, translation: string, wordData?: any) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    
    if (wordData?.phraseId) {
      const phraseWords = songFile.lines.flatMap((line: any, li: number) => 
        line.words.map((w: any, wi: number) => ({ word: w, li, wi }))
      ).filter((item: any) => item.word.phraseId === wordData.phraseId);
      
      const phraseText = phraseWords.map((item: any) => item.word.word).join(' ');
      const leaderWord = phraseWords.find((item: any) => item.word.isPhraseLeader);
      const phraseTranslation = leaderWord?.word.translation || '';
      
      setTooltip({
        word: phraseText,
        translation: phraseTranslation,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    } else {
      setTooltip({
        word,
        translation,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  };

  const handleSave = () => {
    const result = Object.entries(translations).map(([idx, text]) => ({
      lineIndex: parseInt(idx),
      text,
    }));
    onComplete(result);
  };

  const allTranslated = songFile.lines.every((_: any, i: number) => translations[i]?.trim());

  return (
    <div className="space-y-8" onClick={() => setTooltip(null)}>
      <div className="text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#1A1A1A]">
          TRANSLATION
        </h2>
        <p className="text-base text-[#666666]">
          Translate each line of the song. Click on words for hints.
        </p>
        <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#0066CC] to-[#0052A3]"></div>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 rounded-lg border-2 border-[#1A1A1A] bg-white px-4 py-3 text-sm shadow-[6px_6px_0_0_rgba(0,0,0,0.2)] pointer-events-none"
          style={{
            left: Math.min(tooltip.x, window.innerWidth - 200),
            top: tooltip.y - 60,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="font-bold text-[#1A1A1A]">{tooltip.word}</span>
          <span className="text-[#B0B0B0]"> — </span>
          <span className="font-bold text-[#0066CC]">{tooltip.translation || 'no translation'}</span>
        </div>
      )}

      <div className="space-y-4">
        {songFile.lines.map((line: any, li: number) => (
          <div key={li} className="ipod-card overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#1A1A1A] bg-[#F5F5F5] p-4">
              {line.words.map((word: any, wi: number) => {
                const isPhrase = !!word.phraseId;
                return (
                  <button
                    key={wi}
                    onClick={(e) => handleWordClick(e, word.word, word.translation, word)}
                    className={`rounded-lg px-2 py-1 text-base font-medium transition-all ${
                      word.translation
                        ? isPhrase
                          ? 'border-b-2 border-[#9333EA] text-[#9333EA] hover:text-[#7E22CE] cursor-pointer'
                          : 'border-b-2 border-[#0066CC] text-[#1A1A1A] hover:text-[#0066CC] cursor-pointer'
                        : isPhrase
                          ? 'text-[#9333EA] border-b border-[#9333EA]/30'
                          : 'text-[#1A1A1A]'
                    }`}
                  >
                    {word.word}
                    {isPhrase && <span className="ml-1 text-xs opacity-60">⚡</span>}
                  </button>
                );
              })}
            </div>
            <div className="p-4">
              <input
                type="text"
                value={translations[li] || ''}
                onChange={e => handleTranslationChange(li, e.target.value)}
                placeholder="Enter line translation..."
                className="ipod-input w-full rounded-lg px-4 py-3 text-base font-medium placeholder:text-[#B0B0B0]"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!allTranslated}
        className="ipod-button w-full rounded-lg py-4 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed"
      >
        SAVE TRANSLATION
      </button>

      {!allTranslated && (
        <div className="rounded-lg border-2 border-[#0066CC] bg-[#0066CC]/10 p-4 text-center">
          <p className="text-xs font-bold tracking-widest text-[#0066CC]">
            TRANSLATE ALL LINES BEFORE SAVING
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentTranslation;
