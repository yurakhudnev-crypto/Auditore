export interface Teacher {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Song {
  id: string;
  teacher_id: string;
  title: string;
  artist: string;
  cover_url: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  lyrics_data: {
    lines: Array<{
      words: Array<{
        word: string;
        translation: string;
        isGap: boolean;
        correctAnswer?: string;
        wrongAnswers?: string[];
        phraseId?: string;
        isPhraseLeader?: boolean;
      }>;
      studentTranslation: string;
    }>;
  };
  created_at: string;
}

export interface Student {
  id: string;
  teacher_id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  created_at: string;
}

export interface Result {
  id: string;
  student_id: string;
  song_id: string;
  gap_answers: Array<{
    lineIndex: number;
    wordIndex: number;
    selectedAnswer: string;
    isCorrect: boolean;
  }>;
  translations: Array<{
    lineIndex: number;
    text: string;
  }>;
  total_gaps: number;
  correct_gaps: number;
  completed_at: string;
}

export interface ClassLink {
  id: string;
  teacher_id: string;
  link_code: string;
  class_name: string;
  created_at: string;
}
