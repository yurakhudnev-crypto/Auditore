import { useState, useRef, useEffect } from 'react';
import { SongFile, LineData, WordData } from '../types';
import CatalogSettings from './CatalogSettings';
import FormSettings from './FormSettings';

interface Props {
  onBack: () => void;
}

interface EditingWord {
  lineIndex: number;
  wordIndex: number;
}

const TeacherWorkspace = ({ onBack }: Props) => {
  const [mode, setMode] = useState<'select' | 'create' | 'catalog' | 'settings' | 'form'>('select');
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songDifficulty, setSongDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [songTags, setSongTags] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [lines, setLines] = useState<LineData[]>([]);
  const [isPrepared, setIsPrepared] = useState(false);
  const [editingWord, setEditingWord] = useState<EditingWord | null>(null);
  const [translationInput, setTranslationInput] = useState('');
  const [showGapForm, setShowGapForm] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [wrong1, setWrong1] = useState('');
  const [wrong2, setWrong2] = useState('');
  const [savedNotice, setSavedNotice] = useState('');
  
  // Linking mode for phrases
  const [linkingMode, setLinkingMode] = useState(false);
  const [linkingPhraseId, setLinkingPhraseId] = useState<string | null>(null);
  const [linkingWords, setLinkingWords] = useState<{lineIndex: number; wordIndex: number}[]>([]);

  if (mode === 'settings') {
    return <CatalogSettings onBack={() => setMode('select')} />;
  }

  if (mode === 'form') {
    return <FormSettings onBack={() => setMode('select')} />;
  }

  const handlePrepare = () => {
    if (!rawText.trim()) return;
    const textLines = rawText.split('\n').filter(l => l.trim());
    const newLines: LineData[] = textLines.map(line => {
      const words = line.split(/\s+/).filter(w => w);
      return {
        words: words.map(w => ({
          word: w,
          translation: '',
          isGap: false,
        })),
        studentTranslation: '',
      };
    });
    setLines(newLines);
    setIsPrepared(true);
    setEditingWord(null);
  };

  const handleWordClick = (lineIndex: number, wordIndex: number) => {
    if (linkingMode && linkingPhraseId) {
      const word = lines[lineIndex].words[wordIndex];
      const alreadyAdded = linkingWords.some(w => w.lineIndex === lineIndex && w.wordIndex === wordIndex);
      
      if (alreadyAdded) {
        const newLinkingWords = linkingWords.filter(w => !(w.lineIndex === lineIndex && w.wordIndex === wordIndex));
        setLinkingWords(newLinkingWords);
        const newLines = [...lines];
        newLines[lineIndex].words[wordIndex].phraseId = undefined;
        setLines(newLines);
      } else {
        if (linkingWords.length >= 5) {
          alert('Maximum 5 words in a phrase');
          return;
        }
        const newLinkingWords = [...linkingWords, { lineIndex, wordIndex }];
        setLinkingWords(newLinkingWords);
        const newLines = [...lines];
        newLines[lineIndex].words[wordIndex].phraseId = linkingPhraseId;
        setLines(newLines);
      }
      return;
    }
    
    if (editingWord?.lineIndex === lineIndex && editingWord?.wordIndex === wordIndex) {
      setEditingWord(null);
      setShowGapForm(false);
      return;
    }
    
    setEditingWord({ lineIndex, wordIndex });
    const word = lines[lineIndex].words[wordIndex];
    setTranslationInput(word.translation || '');
    setShowGapForm(false);
    
    if (word.isGap && word.correctAnswer && word.correctAnswer.trim()) {
      setCorrectAnswer(word.correctAnswer);
      setWrong1(word.wrongAnswers?.[0] || '');
      setWrong2(word.wrongAnswers?.[1] || '');
      setShowGapForm(true);
    } else {
      setCorrectAnswer(word.word);
      setWrong1('');
      setWrong2('');
    }
  };

  const handleStartLinking = () => {
    if (!editingWord) return;
    const phraseId = `phrase_${Date.now()}`;
    setLinkingMode(true);
    setLinkingPhraseId(phraseId);
    setLinkingWords([editingWord]);
    const newLines = [...lines];
    newLines[editingWord.lineIndex].words[editingWord.wordIndex].phraseId = phraseId;
    newLines[editingWord.lineIndex].words[editingWord.wordIndex].isPhraseLeader = true;
    setLines(newLines);
  };

  const handleFinishLinking = () => {
    if (linkingWords.length > 1) {
      const phraseText = linkingWords.map((w: {lineIndex: number; wordIndex: number}) => lines[w.lineIndex].words[w.wordIndex].word).join(' ');
      setSavedNotice(`Phrase created: "${phraseText}"`);
      setTimeout(() => setSavedNotice(''), 3000);
    }
    setLinkingMode(false);
    setLinkingPhraseId(null);
    setLinkingWords([]);
  };

  const handleCancelLinking = () => {
    const newLines = [...lines];
    linkingWords.forEach((w: {lineIndex: number; wordIndex: number}) => {
      newLines[w.lineIndex].words[w.wordIndex].phraseId = undefined;
      newLines[w.lineIndex].words[w.wordIndex].isPhraseLeader = undefined;
    });
    setLines(newLines);
    setLinkingMode(false);
    setLinkingPhraseId(null);
    setLinkingWords([]);
  };

  const handleSaveTranslation = () => {
    if (!editingWord || !translationInput.trim()) return;
    const newLines = [...lines];
    newLines[editingWord.lineIndex].words[editingWord.wordIndex].translation = translationInput;
    setLines(newLines);
    setSavedNotice(`Translation saved!`);
    setTimeout(() => setSavedNotice(''), 2000);
  };

  const handleMakeGap = () => {
    if (!editingWord) return;
    const word = lines[editingWord.lineIndex].words[editingWord.wordIndex];
    const newLines = [...lines];
    
    if (translationInput.trim()) {
      newLines[editingWord.lineIndex].words[editingWord.wordIndex].translation = translationInput;
    }
    
    if (word.isPhraseLeader && word.phraseId) {
      const phraseWords = lines.flatMap((line, li) => 
        line.words.map((w, wi) => ({ word: w, li, wi }))
      ).filter((item: any) => item.word.phraseId === word.phraseId);
      
      const phraseText = phraseWords.map((item: any) => item.word.word).join(' ');
      
      phraseWords.forEach(item => {
        newLines[item.li].words[item.wi].isGap = true;
      });
      
      newLines[editingWord.lineIndex].words[editingWord.wordIndex].correctAnswer = phraseText;
      newLines[editingWord.lineIndex].words[editingWord.wordIndex].wrongAnswers = ['', ''];
      setLines(newLines);
      
      setCorrectAnswer(phraseText);
      setWrong1('');
      setWrong2('');
      setShowGapForm(true);
    } else {
      newLines[editingWord.lineIndex].words[editingWord.wordIndex].isGap = true;
      newLines[editingWord.lineIndex].words[editingWord.wordIndex].correctAnswer = word.word;
      newLines[editingWord.lineIndex].words[editingWord.wordIndex].wrongAnswers = ['', ''];
      setLines(newLines);
      
      setCorrectAnswer(word.word);
      setWrong1('');
      setWrong2('');
      setShowGapForm(true);
    }
  };

  const handleRemoveGap = () => {
    if (!editingWord) return;
    const newLines = [...lines];
    const word = lines[editingWord.lineIndex].words[editingWord.wordIndex];
    
    if (word.isPhraseLeader && word.phraseId) {
      const phraseWords = lines.flatMap((line, li) => 
        line.words.map((w, wi) => ({ word: w, li, wi }))
      ).filter(item => item.word.phraseId === word.phraseId);
      
      phraseWords.forEach(item => {
        newLines[item.li].words[item.wi].isGap = false;
      });
    } else {
      newLines[editingWord.lineIndex].words[editingWord.wordIndex].isGap = false;
    }
    
    newLines[editingWord.lineIndex].words[editingWord.wordIndex].correctAnswer = undefined;
    newLines[editingWord.lineIndex].words[editingWord.wordIndex].wrongAnswers = undefined;
    setLines(newLines);
    setShowGapForm(false);
  };

  const handleSaveGapAnswers = () => {
    if (!editingWord) return;
    const newLines = [...lines];
    newLines[editingWord.lineIndex].words[editingWord.wordIndex].correctAnswer = correctAnswer;
    newLines[editingWord.lineIndex].words[editingWord.wordIndex].wrongAnswers = [wrong1, wrong2];
    setLines(newLines);
    setShowGapForm(false);
    setSavedNotice(`Options saved!`);
    setTimeout(() => setSavedNotice(''), 2000);
  };

  const handleSaveFile = () => {
    const songFile: SongFile = { title: songTitle || 'Untitled', lines };
    const jsonStr = JSON.stringify(songFile, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `${songFile.title.replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '_').trim() || 'song'}.json`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSavedNotice(`File "${fileName}" saved!`);
    setTimeout(() => setSavedNotice(''), 3000);
  };

  const handleAddToCatalog = () => {
    if (!songTitle.trim() || !coverUrl) {
      alert('Please fill in the song title and add a cover');
      return;
    }
    
    if (getGapCount() === 0 || getGapCount() !== getCompleteGapCount()) {
      alert('Please fill in all gaps before adding to the catalog');
      return;
    }
    
    const songFile: SongFile = { title: songTitle, lines };
    const jsonStr = JSON.stringify(songFile, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `${songTitle.replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '_').trim()}.json`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSavedNotice(`Song "${songTitle}" ready for catalog! Upload the JSON file to your cloud storage.`);
    setTimeout(() => setSavedNotice(''), 5000);
  };

  const getGapCount = () => {
    return lines.reduce((acc, line) => acc + line.words.filter((w: WordData) => w.isGap).length, 0);
  };

  const getCompleteGapCount = () => {
    return lines.reduce((acc, line) => 
      acc + line.words.filter((w: WordData) => 
        w.isGap && 
        w.correctAnswer && 
        w.correctAnswer.trim() !== '' &&
        w.wrongAnswers && 
        w.wrongAnswers[0] && 
        w.wrongAnswers[0].trim() !== '' &&
        w.wrongAnswers[1] && 
        w.wrongAnswers[1].trim() !== ''
      ).length, 0
    );
  };

  const currentWord = editingWord ? lines[editingWord.lineIndex]?.words[editingWord.wordIndex] : null;

  if (mode === 'create') {
    return (
      <div className="min-h-screen ipod-metal">
        <div className="sticky top-0 z-50 border-b border-[#B0B0B0] bg-gradient-to-b from-[#F5F5F5] to-[#E8E8E8] shadow-sm">
          <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-6 py-3">
            <button onClick={() => setMode('select')} className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-colors hover:text-[#0052A3]">
              <span className="transition-transform">←</span>
              BACK
            </button>
            <div className="h-6 w-px bg-[#B0B0B0]"></div>
            <h1 className="text-lg font-bold tracking-tight text-[#1A1A1A]">
              CREATE <span className="text-[#0066CC]">LISTENING</span>
            </h1>
            {isPrepared && (
              <div className="ml-auto rounded-lg border border-[#B0B0B0] bg-white px-4 py-2">
                <span className="text-xs font-bold tracking-widest text-[#666666]">
                  GAPS: {getGapCount()} ({getCompleteGapCount()} READY)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-[1600px] px-6 py-8">
          {!isPrepared ? (
            <div className="space-y-6">
              <div className="ipod-card p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-bold tracking-tight text-[#1A1A1A]">SONG INFORMATION</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-widest text-[#666666]">COVER</label>
                    <div className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-[#B0B0B0] bg-[#F5F5F5] transition-all hover:border-[#0066CC]">
                      {coverUrl ? (
                        <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-center text-[#B0B0B0]">
                          <div className="text-sm">Click to<br/>add cover</div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setCoverUrl(event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold tracking-widest text-[#666666]">SONG TITLE</label>
                      <input type="text" value={songTitle} onChange={e => setSongTitle(e.target.value)} placeholder="e.g. Let It Be" className="ipod-input w-full rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold tracking-widest text-[#666666]">ARTIST</label>
                      <input type="text" value={songArtist} onChange={e => setSongArtist(e.target.value)} placeholder="e.g. The Beatles" className="ipod-input w-full rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-bold tracking-widest text-[#666666]">DIFFICULTY</label>
                        <select value={songDifficulty} onChange={e => setSongDifficulty(e.target.value as 'easy' | 'medium' | 'hard')} className="ipod-input w-full rounded-lg px-3 py-2 text-sm">
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold tracking-widest text-[#666666]">TAGS</label>
                        <input type="text" value={songTags} onChange={e => setSongTags(e.target.value)} placeholder="rock, pop, classic" className="ipod-input w-full rounded-lg px-3 py-2 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ipod-card p-6 sm:p-8">
                <label className="mb-2 block text-xs font-bold tracking-widest text-[#666666]">SONG LYRICS</label>
                <textarea value={rawText} onChange={e => setRawText(e.target.value)} rows={15} placeholder="Paste song lyrics here..." className="ipod-input w-full rounded-lg px-4 py-3 font-mono text-sm" />
              </div>
              <button onClick={handlePrepare} disabled={!rawText.trim()} className="ipod-button w-full rounded-lg py-4 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed">
                PREPARE TEXT
              </button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="ipod-card p-6">
                  <h3 className="mb-4 text-lg font-bold tracking-tight text-[#1A1A1A]">{songTitle || 'Untitled'}</h3>
                  {linkingMode && (
                    <div className="mb-4 rounded-lg border-2 border-[#9333EA] bg-[#9333EA]/10 p-3">
                      <p className="text-xs font-bold tracking-widest text-[#9333EA]">LINKING MODE: Click words to add/remove ({linkingWords.length}/5)</p>
                      <div className="mt-2 flex gap-2">
                        <button onClick={handleFinishLinking} className="rounded-lg bg-[#9333EA] px-3 py-1 text-xs font-bold tracking-widest text-white hover:bg-[#7E22CE]">FINISH</button>
                        <button onClick={handleCancelLinking} className="rounded-lg border border-[#9333EA] px-3 py-1 text-xs font-bold tracking-widest text-[#9333EA] hover:bg-[#9333EA]/20">CANCEL</button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    {lines.map((line, li) => (
                      <div key={li} className="flex flex-wrap items-center gap-2">
                        {line.words.map((word: WordData, wi: number) => {
                          const hasTranslation = !!word.translation && word.translation.trim() !== '';
                          const isCurrentlyEditing = editingWord?.lineIndex === li && editingWord?.wordIndex === wi;
                          const isInLinking = linkingWords.some((w: {lineIndex: number; wordIndex: number}) => w.lineIndex === li && w.wordIndex === wi);
                          const isPhrase = !!word.phraseId;
                          
                          let buttonClass = 'rounded-lg px-3 py-1.5 text-sm font-medium transition-all relative ';
                          
                          if (word.isGap) {
                            buttonClass += 'border-2 border-[#0066CC] bg-[#0066CC]/10 text-[#0066CC] ';
                          } else if (isPhrase) {
                            buttonClass += 'border-2 border-[#9333EA] bg-[#9333EA]/10 text-[#9333EA] ';
                          } else {
                            buttonClass += 'border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] hover:border-[#0066CC] hover:text-[#0066CC] ';
                          }
                          
                          if (hasTranslation && !word.isGap) buttonClass += 'border-b-4 ';
                          if (isCurrentlyEditing) buttonClass += 'ring-4 ring-[#0066CC]/30 ';
                          if (isInLinking) buttonClass += 'ring-4 ring-[#9333EA] animate-pulse ';
                          
                          return (
                            <div key={wi} className="relative inline-block">
                              <button onClick={() => handleWordClick(li, wi)} className={buttonClass} title={hasTranslation ? `Translation: ${word.translation}` : 'No translation'}>
                                {word.isGap ? '___' : word.word}
                              </button>
                              {!word.isGap && !linkingMode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingWord({ lineIndex: li, wordIndex: wi });
                                    handleStartLinking();
                                  }}
                                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#9333EA] text-xs font-bold text-white"
                                  style={{ opacity: 0.6 }}
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                >
                                  +
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sticky top-20 h-fit space-y-4">
                {savedNotice && (
                  <div className="rounded-lg border-2 border-[#0066CC] bg-[#0066CC]/10 p-4 text-sm font-bold tracking-widest text-[#0066CC]">
                    {savedNotice}
                  </div>
                )}
                {editingWord && currentWord ? (
                  <div className="ipod-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                        WORD: <span className="text-[#0066CC]">{currentWord.word}</span>
                      </h3>
                      <button onClick={() => { setEditingWord(null); setShowGapForm(false); }} className="text-3xl text-[#1A1A1A] transition-colors hover:text-[#0066CC] leading-none">×</button>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold tracking-widest text-[#666666]">WORD TRANSLATION</label>
                      <div className="flex gap-3">
                        <input type="text" value={translationInput} onChange={e => setTranslationInput(e.target.value)} placeholder="Enter translation..." className="ipod-input flex-1 rounded-lg px-4 py-2 text-sm" />
                        <button onClick={handleSaveTranslation} disabled={!translationInput.trim()} className={`rounded-lg px-4 py-2 text-sm font-bold tracking-widest transition-all ${currentWord.translation && currentWord.translation === translationInput ? 'bg-[#0066CC] text-white border-2 border-[#0066CC]' : translationInput.trim() ? 'ipod-button text-white' : 'border-2 border-[#B0B0B0] bg-[#F5F5F5] text-[#B0B0B0] cursor-not-allowed'}`}>
                          {currentWord.translation && currentWord.translation === translationInput ? 'OK' : 'SAVE'}
                        </button>
                      </div>
                    </div>
                    {!currentWord.isGap ? (
                      <button onClick={handleMakeGap} className="ipod-button w-full rounded-lg py-4 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5">MAKE GAP</button>
                    ) : (
                      <div className="space-y-4">
                        <button onClick={handleRemoveGap} className="w-full rounded-lg border-2 border-[#1A1A1A] bg-white py-3 text-sm font-bold tracking-widest text-[#1A1A1A] transition-all hover:border-[#0066CC] hover:text-[#0066CC]">REMOVE GAP</button>
                        {!showGapForm ? (
                          <button onClick={() => { setCorrectAnswer(currentWord.correctAnswer || currentWord.word); setWrong1(currentWord.wrongAnswers?.[0] || ''); setWrong2(currentWord.wrongAnswers?.[1] || ''); setShowGapForm(true); }} className="ipod-button w-full rounded-lg py-4 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5">CONFIGURE ANSWER OPTIONS</button>
                        ) : (
                          <div className="space-y-4 rounded-lg border-2 border-[#1A1A1A] bg-[#F5F5F5] p-6">
                            <div>
                              <label className="mb-1 block text-xs font-bold tracking-widest text-[#666666]">CORRECT ANSWER</label>
                              <input type="text" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} className="ipod-input w-full rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold tracking-widest text-[#666666]">WRONG OPTION 1</label>
                              <input type="text" value={wrong1} onChange={e => setWrong1(e.target.value)} className="ipod-input w-full rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold tracking-widest text-[#666666]">WRONG OPTION 2</label>
                              <input type="text" value={wrong2} onChange={e => setWrong2(e.target.value)} className="ipod-input w-full rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <button onClick={handleSaveGapAnswers} disabled={!correctAnswer.trim() || !wrong1.trim() || !wrong2.trim()} className="ipod-button w-full rounded-lg py-3 text-sm font-bold tracking-widest text-white transition-all disabled:bg-[#B0B0B0] disabled:cursor-not-allowed">SAVE OPTIONS</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="ipod-card p-6 text-center">
                    <p className="text-[#666666]">Click on a word to edit</p>
                  </div>
                )}
                <div className="sticky bottom-0 space-y-3 bg-gradient-to-t from-[#E8E8E8] via-[#E8E8E8] to-transparent pt-4">
                  <button onClick={() => { setIsPrepared(false); setEditingWord(null); setShowGapForm(false); }} className="ipod-button-silver w-full rounded-lg py-3 text-sm font-bold tracking-widest text-[#1A1A1A] transition-all hover:-translate-y-0.5">EDIT TEXT</button>
                  <button onClick={handleSaveFile} disabled={getGapCount() === 0} className={`w-full rounded-lg py-3 text-sm font-bold tracking-widest transition-all ${getGapCount() === 0 ? 'border-2 border-[#B0B0B0] bg-[#F5F5F5] text-[#B0B0B0] cursor-not-allowed' : 'ipod-button text-white hover:-translate-y-0.5'}`}>SAVE FILE</button>
                  <button onClick={handleAddToCatalog} disabled={getGapCount() === 0 || !songTitle.trim() || !coverUrl} className="ipod-button w-full rounded-lg py-3 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5 disabled:bg-[#B0B0B0] disabled:cursor-not-allowed">TO CATALOG</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'catalog') {
    return (
      <div className="min-h-screen ipod-metal">
        <div className="sticky top-0 z-50 border-b border-[#B0B0B0] bg-gradient-to-b from-[#F5F5F5] to-[#E8E8E8] shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
            <button onClick={() => setMode('select')} className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-colors hover:text-[#0052A3]">
              <span className="transition-transform">←</span>
              BACK
            </button>
            <div className="h-6 w-px bg-[#B0B0B0]"></div>
            <h1 className="text-lg font-bold tracking-tight text-[#1A1A1A]">
              SONG <span className="text-[#0066CC]">CATALOG</span>
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="ipod-card p-8">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-[#1A1A1A]">CATALOG MANAGEMENT</h2>
            <p className="mb-6 text-sm text-[#666666]">Configure your cloud storage to manage song files</p>
            <button onClick={() => setMode('settings')} className="ipod-button rounded-lg px-6 py-3 text-sm font-bold tracking-widest text-white transition-all hover:-translate-y-0.5">CATALOG SETTINGS</button>
          </div>
        </div>
      </div>
    );
  }

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
            TEACHER <span className="text-[#0066CC]">WORKSPACE</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-5xl font-bold tracking-tight text-[#1A1A1A]">What would you like to do?</h2>
          <p className="text-lg text-[#666666]">Choose an action</p>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#0066CC] to-[#0052A3]"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <button onClick={() => setMode('create')} className="group ipod-card p-8 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] shadow-lg">
                <span className="text-2xl font-bold text-white">01</span>
              </div>
              <svg className="h-6 w-6 text-[#B0B0B0] transition-colors group-hover:text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-[#1A1A1A]">Create Listening</h3>
            <p className="mb-6 text-sm leading-relaxed text-[#666666]">Create a new listening exercise with song lyrics</p>
            <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-all group-hover:gap-3">
              START
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </button>

          <button onClick={() => setMode('catalog')} className="group ipod-card p-8 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] shadow-lg">
                <span className="text-2xl font-bold text-white">02</span>
              </div>
              <svg className="h-6 w-6 text-[#B0B0B0] transition-colors group-hover:text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-[#1A1A1A]">Catalog</h3>
            <p className="mb-6 text-sm leading-relaxed text-[#666666]">Manage song catalog and cloud storage settings</p>
            <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-all group-hover:gap-3">
              OPEN
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </button>

          <button onClick={() => setMode('form')} className="group ipod-card p-8 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] shadow-lg">
                <span className="text-2xl font-bold text-white">03</span>
              </div>
              <svg className="h-6 w-6 text-[#B0B0B0] transition-colors group-hover:text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-[#1A1A1A]">Results</h3>
            <p className="mb-6 text-sm leading-relaxed text-[#666666]">Configure Google Form to collect student results</p>
            <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#0066CC] transition-all group-hover:gap-3">
              SETUP
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherWorkspace;
