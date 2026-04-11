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