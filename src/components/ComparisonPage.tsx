import { useState } from 'react';

interface Props {
  songFile: any;
  translations: any[];
  onComplete: () => void;
}

const ComparisonPage = ({ songFile, translations, onComplete }: Props) => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#1A1A1A]">
          COMPARISON
        </h2>
        <p className="text-base text-[#666666]">
          Compare the original and your translation
        </p>
        <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#0066CC] to-[#0052A3]"></div>
      </div>

      <div className="ipod-card overflow-hidden">
        <div className="grid grid-cols-2 border-b-2 border-[#1A1A1A]">
          <div className="border-r-2 border-[#1A1A1A] bg-[#F5F5F5] p-3">
            <p className="text-xs font-bold tracking-widest text-[#666666]">ORIGINAL</p>
          </div>
          <div className="bg-[#F5F5F5] p-3">
            <p className="text-xs font-bold tracking-widest text-[#666666]">YOUR TRANSLATION</p>
          </div>
        </div>

        <div className="divide-y-2 divide-[#E0E0E0]">
          {songFile.lines.map((line: any, li: number) => {
            const translation = translations.find(t => t.lineIndex === li);
            
            const wordsToShow: string[] = [];
            line.words.forEach((word: any) => {
              if (word.phraseId && !word.isPhraseLeader) {
                return;
              }
              
              if (word.isPhraseLeader && word.phraseId) {
                const phraseWords = line.words.filter((w: any) => w.phraseId === word.phraseId);
                const phraseText = phraseWords.map((w: any) => w.word).join(' ');
                wordsToShow.push(phraseText);
              } else {
                wordsToShow.push(word.word);
              }
            });
            
            const originalText = wordsToShow.join(' ');
            
            return (
              <div key={li} className="grid min-h-[60px] grid-cols-2">
                <div className="border-r-2 border-[#E0E0E0] bg-[#F5F5F5]/30 p-4">
                  <p className="text-sm leading-relaxed text-[#666666]">{originalText}</p>
                </div>
                <div className="bg-[#F5F5F5]/30 p-4">
                  <p className="text-sm leading-relaxed text-[#666666]">
                    {translation?.text || <span className="italic text-[#B0B0B0]">(empty)</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saved}
        className={`w-full rounded-lg py-4 text-sm font-bold tracking-widest transition-all ${
          saved
            ? 'border-2 border-[#0066CC] bg-[#0066CC] text-white'
            : 'ipod-button text-white hover:-translate-y-0.5'
        }`}
      >
        {saved ? 'SAVED!' : 'SAVE RESULT'}
      </button>
    </div>
  );
};

export default ComparisonPage;
