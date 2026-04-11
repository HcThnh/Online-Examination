import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { Question, QuestionPayload, Option } from '../../types';

interface Props {
    initialData?: Question;
    displayOrder: number;
    onSave: (payload: QuestionPayload) => Promise<void>;
    onCancel: () => void;
}

export const QuestionForm: React.FC<Props> = ({ initialData, displayOrder, onSave, onCancel }) => {
    const [questionText, setQuestionText] = useState(initialData?.questionText || '');
    const [points, setPoints] = useState(initialData?.points || 10);

    // Generating default options matching the BE payload property names
    const [options, setOptions] = useState<Option[]>(
        initialData?.options?.length ? initialData.options : [
            { id: 'new-1', optionText: '', isCorrect: true, displayOrder: 1 },
            { id: 'new-2', optionText: '', isCorrect: false, displayOrder: 2 }
        ]
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        // Front-end validation matching BE-3.1 400 Responses
        if (options.length < 2) {
            return setErrorMsg('At least 2 options required');
        }
        const correctCount = options.filter(o => o.isCorrect).length;
        if (correctCount !== 1) {
            return setErrorMsg('Exactly one correct answer required');
        }

        setIsSubmitting(true);

        // Formatting payload properly for displayOrder
        const formattedOptions = options.map((opt, index) => ({
            ...opt,
            displayOrder: index + 1
        }));

        await onSave({
            questionText,
            points,
            displayOrder,
            options: formattedOptions
        });

        setIsSubmitting(false);
    };

    const handleSetCorrect = (id: string | number) => {
        setOptions(options.map(opt => ({ ...opt, isCorrect: opt.id === id })));
    };

    const handleUpdateOption = (id: string | number, newText: string) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, optionText: newText } : opt));
    };

    const handleRemoveOption = (id: string | number) => {
        setOptions(options.filter(opt => opt.id !== id));
    };

    const handleAddOption = () => {
        setOptions([...options, {
            id: `new-${Date.now()}`,
            optionText: '',
            isCorrect: false,
            displayOrder: options.length + 1
        }]);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md border-t-4 border-t-[#0056D2] shadow-md border-x border-b border-[#D1D7DC] mb-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-[20px] font-bold text-[#1F2431]">{initialData ? 'Edit Question' : 'Add New Question'}</h2>
                <button type="button" onClick={onCancel} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded transition-colors"><X size={20} /></button>
            </div>

            {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-[#B32D0F] border border-red-200 rounded-md text-sm font-semibold">
                    {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="col-span-3">
                    <label className="block text-[14px] font-bold text-[#1F2431] mb-2">Question Prompt</label>
                    <textarea
                        value={questionText} onChange={e => setQuestionText(e.target.value)} required rows={3}
                        placeholder="Type your question here..."
                        className="w-full p-3 border border-[#8A92A3] rounded-md outline-none focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2] transition-shadow text-[#1F2431]"
                    />
                </div>
                <div>
                    <label className="block text-[14px] font-bold text-[#1F2431] mb-2">Points</label>
                    <input
                        type="number" min="1" value={points} onChange={e => setPoints(Number(e.target.value))} required
                        className="w-full p-3 border border-[#8A92A3] rounded-md outline-none focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2] transition-shadow text-[#1F2431]"
                    />
                </div>
            </div>

            <div className="mb-6 space-y-3">
                <label className="block text-[14px] font-bold text-[#1F2431] mb-2">Responses</label>
                {options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-3">
                        <input
                            type="radio" name={`correct-option-${displayOrder}`} checked={opt.isCorrect} onChange={() => handleSetCorrect(opt.id!)}
                            className="w-5 h-5 cursor-pointer accent-[#0056D2]"
                        />
                        <input
                            type="text" value={opt.optionText} onChange={e => handleUpdateOption(opt.id!, e.target.value)} required
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1 p-3 border border-[#8A92A3] rounded-md outline-none focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2] transition-shadow text-[#1F2431]"
                        />
                        <button
                            type="button" onClick={() => handleRemoveOption(opt.id!)} disabled={options.length <= 2}
                            className="p-3 text-gray-400 hover:text-[#B32D0F] disabled:opacity-30 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}

                <button type="button" onClick={handleAddOption} className="text-[#0056D2] font-semibold text-[15px] flex items-center gap-2 mt-4 hover:underline">
                    <Plus size={18} /> Add an option
                </button>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#E5E7E8]">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 font-bold text-[#0056D2] hover:bg-[#F0F4FA] rounded-md transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-[#0056D2] hover:bg-[#00419E] text-white rounded-md font-bold transition-colors">
                    {isSubmitting ? 'Saving...' : 'Save Question'}
                </button>
            </div>
        </form>
    );
};