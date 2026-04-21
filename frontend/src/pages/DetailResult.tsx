import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudentService } from '../services/studentService';
import { CheckCircle, XCircle, Info, ChevronLeft, Loader2, Award, Clock, Hash } from 'lucide-react';

const DetailResult = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDetail = async () => {
            if (!attemptId) return;
            try {
                // Gọi API lấy chi tiết bài làm
                const result = await StudentService.getAttemptResult(Number(attemptId));
                setData(result);
            } catch (error) {
                console.error("Error loading exam details:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [attemptId]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD]">
            <Loader2 className="animate-spin text-[#0056D2] mb-4" size={40} />
            <p className="text-[#636363] font-medium animate-pulse">Analyzing your performance...</p>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-20 text-center">
            <div className="bg-red-50 p-6 rounded-full mb-6">
                <Info size={48} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#1F1F1F] mb-2">Result Not Found</h2>
            <p className="text-gray-500 mb-8 max-w-md">We couldn't retrieve the details for this specific attempt. It might have been deleted or moved.</p>
            <button
                onClick={() => navigate('/my-results')}
                className="bg-[#0056D2] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#00419E] transition-all"
            >
                Back to Dashboard
            </button>
        </div>
    );

    // Mapping đúng field từ Swagger: data.questions
    const questionsList = data.questions || [];

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-6">
            <div className="max-w-4xl mx-auto">

                {/* Header Summary Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#D1D7DC] overflow-hidden mb-10">
                    <div className="bg-gradient-to-r from-[#0056D2] to-[#00419E] h-2 w-full" />
                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="flex-1">
                                <button
                                    onClick={() => navigate('/my-results')}
                                    className="group text-[#636363] flex items-center gap-2 text-xs font-black tracking-widest hover:text-[#0056D2] mb-6 transition-colors"
                                >
                                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    BACK TO DASHBOARD
                                </button>

                                <h1 className="text-4xl font-extrabold text-[#1F1F1F] tracking-tight mb-4">
                                    {data.testTitle}
                                </h1>

                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 bg-[#F0F4FA] px-4 py-2 rounded-full border border-[#D1D7DC]">
                                        <Hash size={14} className="text-[#0056D2]" />
                                        <span className="text-sm font-bold text-[#1F1F1F]">Attempt #{attemptId}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-[#F0F4FA] px-4 py-2 rounded-full border border-[#D1D7DC]">
                                        <Clock size={14} className="text-[#636363]" />
                                        <span className="text-sm text-[#636363] font-medium">
                                            {data.submittedAt ? new Date(data.submittedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Score Badge */}
                            <div className="relative group">
                                <div className={`w-36 h-36 flex flex-col items-center justify-center rounded-full border-[10px] bg-white transition-transform group-hover:scale-105 ${data.percentage >= 50 ? 'border-[#E6F4EA]' : 'border-red-50'}`}>
                                    <span className={`text-4xl font-black ${data.percentage >= 50 ? 'text-[#008148]' : 'text-[#B32D0F]'}`}>
                                        {Math.round(data.percentage || 0)}%
                                    </span>
                                    <span className="text-[10px] font-bold text-[#636363] uppercase tracking-widest">Score</span>
                                </div>
                                {data.percentage >= 80 && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-400 p-2 rounded-full shadow-lg border-4 border-white">
                                        <Award size={20} className="text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Breakdown */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-[#1F1F1F] uppercase tracking-tight">Question Review</h2>
                        <span className="text-sm font-bold text-[#636363] bg-white border border-[#D1D7DC] px-4 py-1 rounded-full">
                            Total: {questionsList.length}
                        </span>
                    </div>

                    {questionsList.map((q: any, idx: number) => (
                        <div key={q.questionId || idx} className="bg-white rounded-2xl border border-[#D1D7DC] overflow-hidden hover:border-[#0056D2] transition-colors group">
                            {/* Question Header */}
                            <div className={`px-8 py-4 flex justify-between items-center ${q.isCorrect ? 'bg-[#F6FFF8]' : 'bg-[#FFF9F9]'}`}>
                                <div className="flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-sm font-black border border-[#D1D7DC]">
                                        {idx + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${q.isCorrect ? 'text-[#008148]' : 'text-[#B32D0F]'}`}>
                                            Status
                                        </span>
                                        <span className={`text-sm font-bold ${q.isCorrect ? 'text-[#008148]' : 'text-[#B32D0F]'}`}>
                                            {q.isCorrect ? 'CORRECT' : 'INCORRECT'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-[#636363] uppercase block tracking-widest mb-0.5">Points</span>
                                    <span className="text-sm font-bold text-[#1F1F1F]">
                                        {q.isCorrect ? q.points : 0} / {q.points} pts
                                    </span>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="p-8 md:p-10">
                                <p className="text-xl text-[#1F1F1F] font-bold mb-8 leading-snug">
                                    {q.questionText}
                                </p>

                                <div className="grid gap-4">
                                    {/* Student Answer */}
                                    <div className={`p-5 rounded-xl border-2 flex items-center gap-4 transition-all ${q.isCorrect ? 'bg-white border-[#008148]' : 'bg-white border-[#B32D0F]'}`}>
                                        <div className={`p-2 rounded-lg ${q.isCorrect ? 'bg-[#E6F4EA] text-[#008148]' : 'bg-red-50 text-[#B32D0F]'}`}>
                                            {q.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#636363] uppercase tracking-widest mb-1">Your Response</p>
                                            <p className="text-lg font-bold text-[#1F1F1F]">{q.selectedOptionText || "No answer provided"}</p>
                                        </div>
                                    </div>

                                    {/* Correct Answer (Show only if wrong) */}
                                    {!q.isCorrect && (
                                        <div className="mt-4 p-6 bg-[#F8F9FA] rounded-xl border-l-4 border-[#0056D2]">
                                            <div className="flex gap-4 items-start">
                                                <div className="p-2 bg-[#E6F0FF] rounded-lg text-[#0056D2]">
                                                    <Info size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-[#1F1F1F] uppercase tracking-widest mb-2">The Right Answer is:</p>
                                                    <p className="text-[#0056D2] font-black text-xl mb-3">{q.correctOptionText}</p>
                                                    <div className="h-px bg-[#D1D7DC] w-full my-3" />
                                                    <p className="text-sm text-[#636363] font-medium leading-relaxed italic">
                                                        {q.explanation || "Review the course materials to understand this concept better."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Motivation Footer */}
                <div className="mt-20 text-center pb-20">
                    <div className="inline-block p-1 mb-6 bg-gradient-to-r from-transparent via-[#D1D7DC] to-transparent w-full max-w-sm" />
                    <p className="text-[#636363] font-medium mb-10 tracking-wide">
                        "Success is the sum of small efforts, repeated day in and day out."
                    </p>
                    <button
                        onClick={() => navigate('/my-results')}
                        className="bg-[#1F1F1F] text-white px-12 py-5 rounded-xl font-black text-xs tracking-[0.2em] hover:bg-[#000] shadow-2xl transition-all active:scale-95"
                    >
                        GO TO DASHBOARD
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailResult;