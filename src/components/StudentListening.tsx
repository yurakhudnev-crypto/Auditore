import { useState, useRef, useEffect } from 'react';

interface Props {
  songFile: any;
  onComplete: (answers: any[]) => void;
}

const StudentListening = ({ songFile, onComplete }: Props) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedGap, setSelectedGap] = useState<{ lineIndex: number; wordIndex: number } | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [gapResults, setGapResults] = useState<Record<string, boolean>>({});
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const gapRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getGapKey = (li: number, wi: number) => `${li}-${wi}`;

  const shuffledOptions = useRef<Record<string, string[]>>({});

  useEffect(() => {
    const options: Record<string, string[]> = {};
    songFile.lines.forEach((line: any, li: number) => {
      line.words.forEach((word: any, wi: number) => {
        if (word.isGap && word.correctAnswer && word.wrongAnswers) {
          const key = getGapKey(li, wi);
          const allOptions = [word.correctAnswer, ...word.wrongAnswers];
          options[key] = [...allOptions].sort(() => Math.random() - 0.5);
        }
      });
    });
    shuffledOptions.current = options;
  }, [songFile]);

  const getGapOptions = (lineIndex: number, wordIndex: number): string[] => {
    const key = getGapKey(lineIndex, wordIndex);
    return shuffledOptions.current[key] || [];
  };

  const handleSelectAnswer = (answer: string) => {
    if (!selectedGap || isChecked) return;
    const key = getGapKey(selectedGap.lineIndex, selectedGap.wordIndex);
    setAnswers(prev => ({ ...prev, [key]: answer }));
    setSelectedGap(null);
    setDropdownPosition(null);
  };

  const handleGapClick = (lineIndex: number, wordIndex: number) => {
    if (isChecked) return;
    
    const key = getGapKey(lineIndex, wordIndex);
    const element = gapRefs.current[key];
    
    if (element) {
      const rect = element.getBoundingClientRect();
      
      const menuWidth = 280;
      const menuHeight = 200;
      
      let top = rect.bottom + 8;
      let left = rect.left;
      
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 16;
      }
      
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 8;
      }
      
      if (left < 16) {
        left = 16;
      }
      
      setDropdownPosition({ top, left });
      setSelectedGap({ lineIndex, wordIndex });
    }
  };

  const handleCheck = () => {
    const results: Record<string, boolean> = {};

    songFile.lines.forEach((line: any, li: number) => {
      line.words.forEach((word: any, wi: number) => {
        if (word.isGap && (!word.phraseId || word.isPhraseLeader)) {
          const key = getGapKey(li, wi);
          const selected = answers[key] || '';
          const isCorrect = selected === word.correctAnswer;
          results[key] = isCorrect;
        }
      });
    });

    setGapResults(results);
    setIsChecked(true);
    setSelectedGap(null);
    setDropdownPosition(null);
  };

  const allGapsFilled = () => {
    let allFilled = true;
    songFile.lines.forEach((line: any, li: number) => {
      line.words.forEach((word: any, wi: number) => {
        if (word.isGap && (!word.phraseId || word.isPhraseLeader)) {
          const key = getGapKey(li, wi);
          if (!answers[key]) allFilled = false;
        }
      });
    });
    return allFilled;
  };

  const correctCount = Object.values(gapResults).filter(v => v).length;
  const totalGaps = Object.keys(gapResults).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        selectedGap && 
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node)
      ) {
        const clickedOnGap = Object.values(gapRefs.current).some(
          ref => ref && ref.contains(e.target as Node)
        );
        if (!clickedOnGap) {
          setSelectedGap(null);
          setDropdownPosition(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedGap]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#1A1A1A]">
          {songFile.title}
        </h2>
        <p className="text-base text-[#666666]">
          Listen to the song and choose the correct words in the gaps
        </p>
        <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#0066CC] to-[#0052A3]"></div>
      </div>

      <div className="ipod-card p-6 sm:p-8 space-y-4">
        {songFile.lines.map((line: any, li: number) => (
          <div key={li} className="flex flex-wrap items-center gap-2 min-h-[2.5rem]">
            {line.words.map((word: any, wi: number) => {
              if (word.phraseId && !word.isPhraseLeader && !word.isGap) {
                return null;
              }
              
              if (word.isPhraseLeader && word.phraseId) {
                const phraseWords = line.words.filter((w: any) => w.phraseId === word.phraseId);
                const phraseText = phraseWords.map((w: any) => w.word).join(' ');
                
                if (word.isGap) {
                  const key = getGapKey(li, wi);
                  const selectedAnswer = answers[key];
                  const result = gapResults[key];

                  let bgClass = 'border-2 border-[#0066CC] bg-[#0066CC]/10 text-[#0066CC]';
                  if (isChecked) {
                    if (result === true) bgClass = 'border-2 border-[#1A1A1A] bg-[#1A1A1A] text-white';
                    else if (result === false) bgClass = 'border-2 border-[#1A1A1A] bg-[#1A1A1A]/20 text-[#1A1A1A] line-through';
                  }

                  return (
                    <button
                      key={wi}
                      ref={el => { gapRefs.current[key] = el; }}
                      onClick={() => handleGapClick(li, wi)}
                      disabled={isChecked}
                      className={`rounded-lg px-4 py-1.5 text-sm font-bold tracking-widest transition-all ${bgClass} ${!isChecked ? 'hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]' : ''}`}
                    >
                      {selectedAnswer || '...'}
                    </button>
                  );
                } else {
                  return (
                    <span 
                      key={wi} 
                      className="px-1 text-base font-medium text-[#9333EA] border-b-2 border-[#9333EA]/30"
                    >
                      {phraseText}
                    </span>
                  );
                }
              }
              
              if (!word.isGap) {
                return (
                  <span key={wi} className="px-1 text-base font-medium text-[#1A1A1A]">
                    {word.word}
                  </span>
                );
              }

              const key = getGapKey(li, wi);
              const selectedAnswer = answers[key];
              const result = gapResults[key];

              let bgClass = 'border-2 border-[#0066CC] bg-[#0066CC]/10 text-[#0066CC]';
              if (isChecked) {
                if (result === true) bgClass = 'border-2 border-[#1A1A1A] bg-[#1A1A1A] text-white';
                else if (result === false) bgClass = 'border-2 border-[#1A1A1A] bg-[#1A1A1A]/20 text-[#1A1A1A] line-through';
              }

              return (
                <button
                  key={wi}
                  ref={el => { gapRefs.current[key] = el; }}
                  onClick={() => handleGapClick(li, wi)}
                  disabled={isChecked}
                  className={`rounded-lg px-4 py-1.5 text-sm font-bold tracking-widest transition-all ${bgClass} ${!isChecked ? 'hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]' : ''}`}
                >
                  {selectedAnswer || '...'}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedGap && !isChecked && dropdownPosition && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] overflow-hidden rounded-lg border-2 border-[#0066CC] bg-white shadow-lg"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            minWidth: '240px',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <div className="border-b border-[#0066CC]/20 bg-[#0066CC]/5 p-2">
            <p className="text-xs font-bold tracking-widest text-[#0066CC]">CHOOSE THE CORRECT WORD:</p>
          </div>
          <div className="space-y-0">
            {getGapOptions(selectedGap.lineIndex, selectedGap.wordIndex).map((option, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAnswer(option);
                }}
                className="w-full border-b border-[#E0E0E0] px-6 py-4 text-left text-base font-bold tracking-widest text-[#1A1A1A] transition-all last:border-b-0 hover:bg-[#0066CC] hover:text-white"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isChecked ? (
        <button
          onClick={handleCheck}
          disabled={!allGapsFilled()}
          className="ipod-button w-full rounded-lg py-4 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed"
        >
          CHECK
        </button>
      ) : (
        <div className="space-y-4">
          <div className="ipod-card p-6 sm:p-8 text-center">
            <p className="mb-2 text-4xl font-bold tracking-tight text-[#1A1A1A]">
              RESULT: <span className="text-[#0066CC]">{correctCount}</span> / {totalGaps}
            </p>
            <p className="text-sm font-bold tracking-widest text-[#666666]">
              {correctCount === totalGaps ? 'ALL CORRECT!' : 'GOOD JOB! MOVE TO TRANSLATION.'}
            </p>
          </div>
          <button
            onClick={() => {
              const gapAnswers: any[] = [];
              songFile.lines.forEach((line: any, li: number) => {
                line.words.forEach((word: any, wi: number) => {
                  if (word.isGap && (!word.phraseId || word.isPhraseLeader)) {
                    const key = getGapKey(li, wi);
                    gapAnswers.push({
                      lineIndex: li,
                      wordIndex: wi,
                      selectedAnswer: answers[key] || '',
                      isCorrect: gapResults[key] || false,
                    });
                  }
                });
              });
              onComplete(gapAnswers);
            }}
            className="ipod-button w-full rounded-lg py-4 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5"
          >
            MOVE TO TRANSLATION →
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentListening;
