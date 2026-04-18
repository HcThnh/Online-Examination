import api from './api';

export interface TestItem {
  id: string;
  title: string;
  passcode: string;
  questionCount: number;
  createdAt: string;
}

export const TestService = {
  getTests: async (): Promise<TestItem[]> => {
    const response = await api.get('/teacher/tests');
    return response.data;
  },

  deleteTest: async (testId: string): Promise<void> => {
    await api.delete(`/teacher/tests/${testId}`);
  },

  createTest: async (testData: { title: string; description: string; passcode: string }): Promise<{ id: string }> => {
    const response = await api.post('/teacher/tests', testData);
    return response.data;
  },
  
  updateTest: async (testId: string, testData: { title: string; description: string; passcode: string }): Promise<void> => {
    await api.put(`/teacher/tests/${testId}`, testData);
  },

  getTestStatistics: async (testId: string): Promise<TestStatistics> => {
    const response = await api.get(`/teacher/tests/${testId}/statistics`);
    return response.data;
  },

  getQuestionAnalysis: async (testId: string): Promise<QuestionAnalysis[]> => {
    const response = await api.get(`/teacher/tests/${testId}/question-analysis`);
    return response.data;
  },
};

export interface TestStatistics {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  totalStudents: number;
  scoreDistribution: {
    bucket: string;
    count: number;
  }[];
}

export interface QuestionAnalysis {
  questionId: number;
  questionOrder?: number;
  questionText: string;
  points: number;           // BE-14.1 says "points"
  correctRate: number;
  totalAnswers: number;
  optionDistribution: {    // BE-14.1 says "optionDistribution"
    optionId: number;
    optionText: string;
    isCorrect: boolean;
    count: number;
    percentage: number;
  }[];
}