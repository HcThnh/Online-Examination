import type { Question, QuestionPayload } from '../types';

// Base URL pattern: /api/teacher/tests/{testId}/questions
export const testService = {
    // BE-3.2 Get Questions
    getQuestions: async (testId: string): Promise<Question[]> => {
        // GET /api/teacher/tests/{testId}/questions
        // Mocking the API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        return []; // Returns empty array to simulate a new test
    },

    // BE-3.1 Add Question
    createQuestion: async (testId: string, payload: QuestionPayload): Promise<Question> => {
        // POST /api/teacher/tests/{testId}/questions
        await new Promise(resolve => setTimeout(resolve, 400));
        return { ...payload, id: `q-${Date.now()}` } as Question;
    },

    // BE-3.3 Update Question
    updateQuestion: async (testId: string, questionId: string | number, payload: QuestionPayload): Promise<Question> => {
        // PUT /api/teacher/tests/{testId}/questions/{questionId}
        await new Promise(resolve => setTimeout(resolve, 400));
        return { ...payload, id: questionId } as Question;
    },

    // BE-3.4 Delete Question
    deleteQuestion: async (testId: string, questionId: string | number): Promise<void> => {
        // DELETE /api/teacher/tests/{testId}/questions/{questionId}
        await new Promise(resolve => setTimeout(resolve, 400));
    },

    // BE-3.5 Reorder Questions
    reorderQuestions: async (testId: string, questionIds: (string | number)[]): Promise<void> => {
        // PUT /api/teacher/tests/{testId}/questions/reorder
        // Payload required by BE: { "questionIds": [3, 1, 2] }
        console.log(`PUT /api/teacher/tests/${testId}/questions/reorder`, { questionIds });
        await new Promise(resolve => setTimeout(resolve, 400));
    }
};