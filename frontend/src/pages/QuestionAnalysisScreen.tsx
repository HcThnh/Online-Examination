import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  BarChart2, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Filter
} from 'lucide-react';
import { TestService, type QuestionAnalysis } from '../services/teacherTestService';

// Determine the color of the rate bar
const getRateColor = (rate: number) => {
  if (rate >= 70) return 'bg-green-500';
  if (rate >= 40) return 'bg-amber-400';
  return 'bg-red-500';
};

const getRateTextColor = (rate: number) => {
  if (rate >= 70) return 'text-green-600';
  if (rate >= 40) return 'text-amber-600';
  return 'text-red-600';
};

const QuestionAnalysisScreen: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<QuestionAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sorting: 'order', 'hardest', 'easiest'
  const [sortBy, setSortBy] = useState<'order' | 'hardest' | 'easiest'>('order');
  
  // Expanded questions state tracking
  const [expandedQs, setExpandedQs] = useState<Record<number, boolean>>({});

  // Feature: Mock Data Toggle
  const USE_MOCK_DATA = false; // Switched to false as requested

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        setTimeout(() => {
          setQuestions([
            {
              questionId: 1,
              questionOrder: 1,
              questionText: 'What is the primary function of Mitochondria in a cell?',
              points: 10,
              correctRate: 85,
              totalAnswers: 100,
              optionDistribution: [
                { optionId: 1, optionText: 'Generate energy (ATP)', isCorrect: true, count: 85, percentage: 85 },
                { optionId: 2, optionText: 'Synthesize proteins', isCorrect: false, count: 10, percentage: 10 },
                { optionId: 3, optionText: 'Store genetic information', isCorrect: false, count: 2, percentage: 2 },
                { optionId: 4, optionText: 'Break down cellular waste', isCorrect: false, count: 3, percentage: 3 },
              ]
            },
            {
              questionId: 2,
              questionOrder: 2,
              questionText: 'Which planet is known as the Red Planet and why?',
              points: 15,
              correctRate: 55,
              totalAnswers: 100,
              optionDistribution: [
                { optionId: 5, optionText: 'Jupiter, due to its Great Red Spot', isCorrect: false, count: 20, percentage: 20 },
                { optionId: 6, optionText: 'Mars, due to iron oxide on its surface', isCorrect: true, count: 55, percentage: 55 },
                { optionId: 7, optionText: 'Venus, due to its thick, hot atmosphere', isCorrect: false, count: 15, percentage: 15 },
                { optionId: 8, optionText: 'Saturn, due to the reflection of its rings', isCorrect: false, count: 10, percentage: 10 },
              ]
            },
            {
              questionId: 3,
              questionOrder: 3,
              questionText: 'Who wrote the play "Romeo and Juliet"?',
              points: 5,
              correctRate: 35,
              totalAnswers: 100,
              optionDistribution: [
                { optionId: 9, optionText: 'Charles Dickens', isCorrect: false, count: 30, percentage: 30 },
                { optionId: 10, optionText: 'William Shakespeare', isCorrect: true, count: 35, percentage: 35 },
                { optionId: 11, optionText: 'Jane Austen', isCorrect: false, count: 15, percentage: 15 },
                { optionId: 12, optionText: 'Mark Twain', isCorrect: false, count: 20, percentage: 20 },
              ]
            }
          ]);
          setIsLoading(false);
        }, 800);
        return;
      }

      if (testId) {
        try {
          const data = await TestService.getQuestionAnalysis(testId);
          setQuestions(data);
        } catch (err: any) {
          setError('Failed to load question analysis data. Please try again.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAnalysis();
  }, [testId, USE_MOCK_DATA]);

  const toggleExpand = (questionId: number) => {
    setExpandedQs((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === 'order') return (a.questionOrder ?? 0) - (b.questionOrder ?? 0);
    if (sortBy === 'hardest') return a.correctRate - b.correctRate;
    if (sortBy === 'easiest') return b.correctRate - a.correctRate;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="font-semibold">Loading Analysis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header Navigation */}
        <button 
          onClick={() => navigate(`/dashboard/tests/${testId}/results`)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors font-medium text-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Class Results
        </button>

        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
              <BarChart2 className="w-8 h-8 text-primary" />
              Question Analysis
            </h1>
            <p className="text-slate-500">
              Analyze how well students performed on each question.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'order' | 'hardest' | 'easiest')}
              className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="order">Default Order</option>
              <option value="hardest">Hardest First</option>
              <option value="easiest">Easiest First</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-4 rounded-2xl flex items-center gap-3">
            <AlertCircle size={24} />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {sortedQuestions.map((q) => {
            const isExpanded = expandedQs[q.questionId];

            return (
              <div key={q.questionId} className="bg-white border text-left border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:border-gray-300">
                {/* Header Row */}
                <div 
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cursor-pointer"
                  onClick={() => toggleExpand(q.questionId)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Question {q.questionOrder ?? '—'}
                      </span>
                      <span className="text-slate-400 text-xs font-semibold px-1 rounded-full border border-slate-200">
                        {q.points} pts
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base leading-relaxed">
                      {q.questionText}
                    </h3>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0 px-2 md:px-0">
                    <div className="flex flex-col items-end gap-1.5 w-full md:w-32">
                      <div className="flex justify-between w-full items-end">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correct</span>
                        <span className={`font-extrabold ${getRateTextColor(q.correctRate)}`}>
                          {q.correctRate}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getRateColor(q.correctRate)} transition-all duration-1000`}
                          style={{ width: `${q.correctRate}%` }}
                        />
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 p-1 md:block hidden">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Section: Answer Distribution */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-gray-100 p-5 px-6 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <TrendingUp size={16} className="text-slate-400" />
                      Answer Distribution
                    </h4>
                    
                    <div className="space-y-3">
                      {(q.optionDistribution ?? []).map((opt) => (
                        <div 
                          key={opt.optionId} 
                          className={`flex items-center justify-between p-3 rounded-xl border ${
                            opt.isCorrect 
                              ? 'bg-green-50 border-green-100' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 max-w-[70%]">
                            {opt.isCorrect ? (
                              <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle size={18} className="text-slate-300 flex-shrink-0" />
                            )}
                            <span className={`text-sm font-medium ${opt.isCorrect ? 'text-green-800' : 'text-slate-600'}`}>
                              {opt.optionText}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 w-1/3">
                            <div className="hidden sm:block flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-700 ${
                                  opt.isCorrect ? 'bg-green-400' : 'bg-slate-300'
                                }`}
                                style={{ width: `${opt.percentage}%` }}
                              />
                            </div>
                            <div className="flex flex-col items-end min-w-[50px]">
                              <span className="text-sm font-bold text-slate-700">{opt.percentage}%</span>
                              <span className="text-xs text-slate-500">{opt.count} picks</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionAnalysisScreen;
