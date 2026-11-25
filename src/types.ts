export interface WordData {
  word: string;
  translation: string;
  isGap: boolean;
  correctAnswer?: string;
  wrongAnswers?: string[];
  phraseId?: string;
  isPhraseLeader?: boolean;
}

export interface LineData {
  words: WordData[];
  studentTranslation: string;
}

export interface SongFile {
  title: string;
  lines: LineData[];
}

export interface StudentInfo {
  firstName: string;
  lastName: string;
  className: string;
}

export interface GapAnswer {
  lineIndex: number;
  wordIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface StudentResult {
  studentInfo: StudentInfo;
  songTitle: string;
  date: string;
  gapAnswers: GapAnswer[];
  translations: { lineIndex: number; text: string }[];
  totalGaps: number;
  correctGaps: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  file: string;
  fileId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface SongsList {
  songs: Song[];
}
