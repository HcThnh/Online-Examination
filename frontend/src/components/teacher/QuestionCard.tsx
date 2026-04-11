import React from 'react';
import { ArrowUp, ArrowDown, CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import type { Question } from '../../types';

interface Props {
    question: Question;
    index: number;
    totalQuestions: number;
    onEdit: () => void;
    onDelete: () => void;
    onMove: (dir: 'up' | 'down') => void;
}

export const QuestionCard: React.FC<Props> = ({ question, index, totalQuestions, onEdit, onDelete, onMove }) => {
    return (
        <div className="bg-white p-6 rounded-md border border-[#D1D7DC] hover:shadow-sm transition-shadow flex gap-5">
            {/* Reordering Controls */}
            <div className="flex flex-col items-center justify-start gap-1 pr-5 border-r border-[#E5E7E8]">
                <button onClick={() => onMove('up')} disabled={index === 0} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors">
                    <ArrowUp size={18} />
                </button>
                <span className="text-sm font-bold text-[#1F2431]">{index + 1}</span>
                <button onClick={() => onMove('down')} disabled={index === totalQuestions - 1} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors">
                    <ArrowDown size={18} />
                </button>
            </div>

            {/* Question Content */}
            <div className="flex-1">
                <div className="flex justify-between items-start mb-5">
                    <h3 className="text-lg font-semibold text-[#1F2431] leading-relaxed">{question.questionText}</h3>
                    <div className="flex gap-2 items-center">
                        <span className="text-[#525A6E] text-xs font-semibold px-2 py-1 rounded-full bg-gray-100">
                            {question.options.length} options
                        </span>
                        <span className="bg-[#F5F7F8] text-[#1F2431] border border-[#D1D7DC] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                            {question.points} Points
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    {question.options.map((opt, idx) => (
                        <div key={opt.id || idx} className="flex items-start gap-3 text-[15px] text-[#1F2431]">
                            <div className="mt-0.5">
                                {opt.isCorrect ? (
                                    <CheckCircle2 size={20} className="text-[#008A27] fill-[#008A27]/10" />
                                ) : (
                                    <Circle size={20} className="text-[#8A92A3]" />
                                )}
                            </div>
                            <span className={opt.isCorrect ? 'font-semibold text-[#1F2431]' : ''}>{opt.optionText}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pl-4">
                <button onClick={onEdit} title="Edit question" className="p-2 text-[#0056D2] hover:bg-[#F0F4FA] rounded-md transition-colors">
                    <Pencil size={18} />
                </button>
                <button onClick={onDelete} title="Delete question" className="p-2 text-gray-500 hover:text-[#B32D0F] hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};