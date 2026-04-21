export interface Option {
  id?: number | string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface Question {
  id: number | string;
  questionText: string;
  points: number;
  displayOrder: number;
  options: Option[];
}

export interface QuestionPayload {
  questionText: string;
  points: number;
  displayOrder: number;
  options: Option[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface Test {
  id: string;
  title: string;
  description: string;
  passcode: string;
}

export interface SimpleQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Option {
  id?: number | string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface Question {
  id: number | string;
  questionText: string;
  points: number;
  displayOrder: number;
  options: Option[];
}

export interface QuestionPayload {
  questionText: string;
  points: number;
  displayOrder: number;
  options: Option[];
}
export interface Exam {
  id: string;
  title: string;
  description?: string;
  teacherId: string;
  questions: Question[];
  createdAt: string;
}

export interface Result {
  id: string;             // attemptId
  examId: string;
  examTitle: string;
  studentName: string;
  score: number;
  totalPoints: number;
  submittedAt: string;
  answers: StudentAnswer[];
}


export interface StudentAnswer {
  questionText: string;
  selectedOptionText: string;
  correctOptionText: string;
  selectedOption: number;
  correctOption: number;
  points: number;
}
