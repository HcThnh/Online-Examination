import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, AlertCircle, FileText } from 'lucide-react';

import { testService } from '../services/testService';
import type { Question, QuestionPayload } from '../types';
import { QuestionCard } from '../components/teacher/QuestionCard';
import { QuestionForm } from '../components/teacher/QuestionForm';

export default function EditTest() {
    const { testId: urlTestId } = useParams<{ testId: string }>();
    const [activeTestId] = useState<string>(urlTestId || `test-${Date.now()}`);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const fetchQuestions = useCallback(async () => {
        if (!urlTestId) {
            setQuestions([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            // Calls BE-3.2 GET API
            const data = await testService.getQuestions(activeTestId);
            // Sort by displayOrder just in case backend doesn't
            const sortedData = data.sort((a, b) => a.displayOrder - b.displayOrder);
            setQuestions(sortedData);
        } catch (err: any) {
            setError('Failed to load questions.');
        } finally {
            setIsLoading(false);
        }
    }, [urlTestId, activeTestId]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleSave = async (payload: QuestionPayload) => {
        // Determine if we are editing an existing question or adding a new one
        const existingQuestion = questions.find(q => q.displayOrder === payload.displayOrder);

        if (existingQuestion && editingId) {
            // Calls BE-3.3 PUT API
            const updatedQ = await testService.updateQuestion(activeTestId, existingQuestion.id, payload);
            setQuestions(prev => prev.map(q => q.id === existingQuestion.id ? updatedQ : q));
            setEditingId(null);
        } else {
            // Calls BE-3.1 POST API
            const newQ = await testService.createQuestion(activeTestId, payload);
            setQuestions(prev => [...prev, newQ]);
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        // Calls BE-3.4 DELETE API
        await testService.deleteQuestion(activeTestId, id);

        // Remove locally and re-sync display orders
        const filtered = questions.filter(q => q.id !== id);
        const reordered = filtered.map((q, i) => ({ ...q, displayOrder: i + 1 }));
        setQuestions(reordered);

        // Automatically reorder the backend after a deletion to maintain sequence
        await testService.reorderQuestions(activeTestId, reordered.map(q => q.id));
    };

    const handleReorder = async (index: number, direction: 'up' | 'down') => {
        const newQuestions = [...questions];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newQuestions.length) return;

        // Swap items locally
        [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];

        // Update displayOrder properties
        const reordered = newQuestions.map((q, i) => ({ ...q, displayOrder: i + 1 }));
        setQuestions(reordered);

        // Calls BE-3.5 PUT Reorder API
        await testService.reorderQuestions(activeTestId, reordered.map(q => q.id));
    };

    if (isLoading) return <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center font-semibold text-[#8A92A3]">Loading assessment...</div>;
    if (error) return <div className="p-10 text-[#B32D0F] flex justify-center"><AlertCircle className="mr-2" />{error}</div>;

    return (
        <div className="min-h-screen bg-[#F5F7F8] pb-20 font-sans">
            <header className="bg-white border-b border-[#D1D7DC] py-6 px-8 mb-8 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#0056D2] p-2 rounded-md"><FileText className="text-white" size={24} /></div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#1F2431]">{urlTestId ? 'Edit Assessment' : 'New Assessment'}</h1>
                            <div className="text-sm text-[#525A6E] mt-0.5 flex gap-3">
                                <span>Test ID: {activeTestId}</span>
                                <span>•</span>
                                <span className="font-semibold">{questions.length} Questions</span>
                                <span>•</span>
                                <span className="font-semibold">{questions.reduce((sum, q) => sum + q.points, 0)} Total Points</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => { setIsAdding(true); setEditingId(null); }}
                        disabled={isAdding}
                        className="flex items-center gap-2 bg-[#0056D2] hover:bg-[#00419E] transition-colors text-white font-bold px-5 py-2.5 rounded-md disabled:opacity-50"
                    >
                        <Plus size={20} /> Add Question
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-8">
                <div className="space-y-4">
                    {questions.map((q, index) => (
                        editingId === q.id ? (
                            <QuestionForm
                                key={q.id} initialData={q} displayOrder={q.displayOrder}
                                onSave={handleSave} onCancel={() => setEditingId(null)}
                            />
                        ) : (
                            <QuestionCard
                                key={q.id} question={q} index={index} totalQuestions={questions.length}
                                onEdit={() => { setEditingId(q.id); setIsAdding(false); }}
                                onDelete={() => handleDelete(q.id)}
                                onMove={(dir) => handleReorder(index, dir)}
                            />
                        )
                    ))}

                    {isAdding && (
                        <QuestionForm displayOrder={questions.length + 1} onSave={handleSave} onCancel={() => setIsAdding(false)} />
                    )}

                    {questions.length === 0 && !isAdding && (
                        <div className="text-center py-20 bg-white rounded-md border border-[#D1D7DC]">
                            <h3 className="text-xl font-bold text-[#1F2431] mb-2">This assessment has no questions</h3>
                            <p className="text-[#525A6E] mb-6">Start building your quiz by adding multiple choice questions.</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="text-[#0056D2] font-bold hover:bg-[#F0F4FA] px-6 py-3 rounded-md transition-colors border border-transparent hover:border-[#0056D2]"
                            >
                                + Add your first question
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}