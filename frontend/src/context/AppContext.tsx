import React, { createContext, useContext, useState } from 'react';
// Import các Type của bạn
import type { Exam, Result } from '../types';

interface AppContextType {
    exams: Exam[];
    results: Result[];
    addExam: (exam: Exam) => void;
    updateExam: (exam: Exam) => void;
    deleteExam: (id: string) => void;
    addResult: (result: Result) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [results, setResults] = useState<Result[]>([]);


    const addExam = (exam: Exam) => setExams([...exams, exam]);

    const updateExam = (updatedExam: Exam) => {
        setExams(prev => prev.map(e => e.id === updatedExam.id ? updatedExam : e));
    };

    const deleteExam = (id: string) => setExams(exams.filter(e => e.id !== id));

    const addResult = (result: Result) => setResults([result, ...results]);

    return (
        <AppContext.Provider value={{ exams, results, addExam, updateExam, deleteExam, addResult }}>
            {children}
        </AppContext.Provider>
    );
};

// ĐÂY LÀ DÒNG BẠN ĐANG THIẾU:
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};