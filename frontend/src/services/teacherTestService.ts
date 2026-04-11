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
};