export interface QuizQuestion {
  questionNumber: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface Quiz {
  topic: string;
  subTopic?: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export type QuizDifficulty = 'mixed' | 'easy' | 'medium' | 'hard';
