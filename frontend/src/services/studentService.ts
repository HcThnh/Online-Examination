import api from "./api";

export interface Question {
    testTitle: string;
    testDescription: string;
    totalQuestions: number;
    questions: {
        id: number;
        questionText: string;
        points: number;
        displayOrder: number;
        options: {
            id: number;
            optionText: string;
            displayOrder: number;
        }[];
    }[];
}

export const StudentService = {
    getAllQuestions: async (id: number): Promise<Question> => {
        const response = await api.get<Question>(`/student/tests/${id}/questions`);
        return response.data;
    },

    getPastResult: async () => {
        const response = await api.get(`/student/my-results`);
        return response.data;
    },

    getAttemptResult: async (attemptId: number) => {
        const response = await api.get(`/student/attempts/${attemptId}`);
        return response.data;
    },

    submitTestAnswer: async (testId: number, answers: { questionId: number, selectedOptionId: number }[]) => {
        const response = await api.post(`/student/tests/${testId}/submit`, { answers });
        return response.data;
    },

    accessTestViaPasscode: async (passcode: string) => {
        const response = await api.post(`/student/tests/access`, { passcode });
        return response.data;
    },
}