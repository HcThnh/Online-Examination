import api from './api';
import type { Question, QuestionPayload } from '../types';

const API_BASE_URL = '/teacher/tests';

export const testService = {
  // BE-3.2: Get Questions
  getQuestions: async (testId: string): Promise<Question[]> => {
    try {
      const response = await api.get(`${API_BASE_URL}/${testId}/questions`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error("Lỗi lấy danh sách câu hỏi:", error.response?.status);
      return [];
    }
  },

  // BE-3.1: Add Question
  createQuestion: async (testId: string, payload: QuestionPayload): Promise<Question> => {
    const response = await api.post(`${API_BASE_URL}/${testId}/questions`, payload);
    return response.data;
  },

  // BE-3.3: Update Question
  updateQuestion: async (testId: string, questionId: string | number, payload: QuestionPayload): Promise<Question> => {
    const response = await api.put(`${API_BASE_URL}/${testId}/questions/${questionId}`, payload);
    return response.data;
  },

  // BE-3.4: Delete Question
  deleteQuestion: async (testId: string, questionId: string | number): Promise<void> => {
    await api.delete(`${API_BASE_URL}/${testId}/questions/${questionId}`);
  },

  // BE-3.5: Reorder Questions
  reorderQuestions: async (testId: string, questionIds: (string | number)[]): Promise<void> => {
    await api.put(`${API_BASE_URL}/${testId}/questions/reorder`, { questionIds });
  }
};