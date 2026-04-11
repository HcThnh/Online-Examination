import api from "./api";

export interface Question {
    id: number;
    questionText: string;
    point: number;
    displayOrder: number;
    options: {
        id: number;
        optionText: string;
        isCorrect: boolean;
        displayOrder: number;
    }[];
}

// Tạo thêm type mới dùng riêng cho việc Create/Update (Không chứa ID)
export interface QuestionPayload {
    questionText: string;
    point: number;
    displayOrder: number;
    options: {
        optionText: string;
        isCorrect: boolean;
        displayOrder: number;
        id?: number; // Có thể có hoặc không khi update
    }[];
}

export const QuestionService = {
    getQuestions: async (testId: string): Promise<Question[]> => {
        const response = await api.get(`/teacher/tests/${testId}/questions`);
        return response.data;
    },

    // Đổi type của questionData thành QuestionPayload (bỏ dấu [] bị dư)
    createQuestion: async (testId: string, questionData: QuestionPayload): Promise<void> => {
        await api.post(`/teacher/tests/${testId}/questions`, questionData);
    },

    updateQuestion: async (testId: string, questionId: string, questionData: QuestionPayload): Promise<void> => {
        await api.put(`/teacher/tests/${testId}/questions/${questionId}`, questionData);
    },

    deleteQuestion: async (testId: string, questionId: string): Promise<void> => {
        await api.delete(`/teacher/tests/${testId}/questions/${questionId}`);
    },
}