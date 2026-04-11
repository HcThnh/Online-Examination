import api from './api';

export const getQuestions = async (testId: string) => {
  const response = await api.get(`/teacher/tests/${testId}/questions`);
  return response.data;
};

export const addQuestion = async (testId: string, questionData: any) => {
  const response = await api.post(`/teacher/tests/${testId}/questions`, questionData);
  return response.data;
};

export const updateQuestion = async (testId: string, questionId: string, questionData: any) => {
  const response = await api.put(`/teacher/tests/${testId}/questions/${questionId}`, questionData);
  return response.data;
};

export const deleteQuestion = async (testId: string, questionId: string) => {
  const response = await api.delete(`/teacher/tests/${testId}/questions/${questionId}`);
  return response.data;
};

export const reorderQuestions = async (testId: string, questionIds: string[]) => {
  const response = await api.put(`/teacher/tests/${testId}/questions/reorder`, { questionIds });
  return response.data;
};

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
};