import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  AlertCircle,
  FileText,
  Loader2,
  LayoutDashboard,
  Settings2,
  ChevronLeft
} from 'lucide-react';

import { testService } from '../services/testService';
import type { Question, QuestionPayload } from '../types';
import { QuestionCard } from '../components/teacher/QuestionCard';
import { QuestionForm } from '../components/teacher/QuestionForm';

export default function EditTest() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  // State Management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  /**
   * BE-3.2: Fetch Questions for a Test
   */
  const fetchQuestions = useCallback(async () => {
    if (!testId) return;
    setIsLoading(true);
    try {
      const data = await testService.getQuestions(testId);
      const sortedData = [...data].sort((a, b) => a.displayOrder - b.displayOrder);
      setQuestions(sortedData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to retrieve lesson data from the server.');
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /**
   * BE-3.1 & BE-3.3: Create or Update Question
   */
  const handleSave = async (payload: QuestionPayload) => {
    if (!testId) return;
    try {
      if (editingId) {
        const updatedQ = await testService.updateQuestion(testId, editingId, payload);
        setQuestions(prev => prev.map(q => q.id === editingId ? updatedQ : q));
        setEditingId(null);
      } else {
        const newQ = await testService.createQuestion(testId, payload);
        setQuestions(prev => [...prev, newQ]);
        setIsAdding(false);
      }
    } catch (err: any) {
      const backendError = err.response?.data?.error || "Check that you have at least 2 options and exactly 1 correct answer.";
      alert(`Drafting Error: ${backendError}`);
    }
  };

  /**
   * BE-3.4: Delete Question
   */
  const handleDelete = async (id: string | number) => {
    if (!testId) return;
    if (!window.confirm("Remove this practice item?")) return;

    try {
      await testService.deleteQuestion(testId, id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      alert("Failed to sync deletion. Please refresh.");
      fetchQuestions();
    }
  };

  /**
   * BE-3.5: Reorder Questions
   */
  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if (!testId) return;
    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newQuestions.length) return;

    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];
    setQuestions([...newQuestions]);

    try {
      await testService.reorderQuestions(testId, newQuestions.map(q => q.id));
    } catch (err) {
      fetchQuestions();
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#F5F7F8] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-[#0056D2] mb-4" size={32} />
      <p className="text-[#636363] font-medium animate-pulse">Loading Practice Designer...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg border border-red-100 shadow-sm text-center max-w-md">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
        <h2 className="text-[#1F1F1F] font-bold text-xl mb-2">Connection Issue</h2>
        <p className="text-[#636363] text-sm mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-[#0056D2] text-white px-6 py-2 rounded font-bold text-sm hover:bg-[#00419E]">
          RETRY CONNECTION
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7F8] pb-32">
      {/* COURSERA-STYLE HEADER */}
      <header className="bg-white border-b border-[#D1D7DC] py-4 px-8 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">

          {/* Top Navigation Row */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="flex items-center gap-2 text-[#636363] hover:text-[#0056D2] transition-all group"
            >
              <div className="p-1.5 rounded-full group-hover:bg-[#F0F4FA]">
                <ChevronLeft size={20} />
              </div>
              <div className="flex items-center gap-2">
                <LayoutDashboard size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
              </div>
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="text-[#636363] hover:text-[#1F1F1F] 
                font-bold text-sm px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { setIsAdding(true); setEditingId(null); }}
                disabled={isAdding}
                className="bg-[#0056D2] hover:bg-[#00419E] text-white font-bold px-6 py-2.5 rounded text-sm transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Plus size={18} strokeWidth={3} /> Add Question
              </button>
            </div>
          </div>

          {/* Title & Info Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-[#F5F7F8] pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#0056D2] uppercase tracking-widest">
                <Settings2 size={12} />
                Course Content Management
              </div>
              <h1 className="text-2xl font-semibold text-[#1F1F1F]">
                {testId ? 'Customize Practice Session' : 'Draft New Practice'}
              </h1>
            </div>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <div className="flex flex-col items-end">
                <span className="text-xs text-[#636363] font-medium">
                  Total Items: <b className="text-[#1F1F1F]">{questions.length}</b>
                </span>
                <span className="text-xs text-[#636363] font-medium">
                  Total Points: <b className="text-[#1F1F1F]">{questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0)}</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 mt-10">
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id || `question-${index}`} className="scroll-mt-32">
              {editingId === q.id ? (
                <div className="bg-white rounded-lg shadow-xl border-2 border-[#0056D2] overflow-hidden">
                  <div className="bg-[#F0F4FA] px-6 py-2 border-b border-[#CFE1F6]">
                    <span className="text-[10px] font-bold text-[#0056D2] uppercase tracking-widest">Editing Item #{index + 1}</span>
                  </div>
                  <QuestionForm
                    initialData={q}
                    displayOrder={q.displayOrder}
                    onSave={handleSave}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-[#D1D7DC] hover:border-[#0056D2] transition-all group shadow-sm">
                  <QuestionCard
                    question={q}
                    index={index}
                    totalQuestions={questions.length}
                    onEdit={() => { setEditingId(q.id); setIsAdding(false); }}
                    onDelete={() => handleDelete(q.id)}
                    onMove={(dir) => handleReorder(index, dir)}
                  />
                </div>
              )}
            </div>
          ))}

          {isAdding && (
            <div className="bg-white rounded-lg shadow-xl border-2 border-[#0056D2] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-[#F0F4FA] px-6 py-3 border-b border-[#CFE1F6]">
                <span className="text-[10px] font-bold text-[#0056D2] uppercase tracking-widest">Drafting New Entry</span>
              </div>
              <QuestionForm
                displayOrder={questions.length + 1}
                onSave={handleSave}
                onCancel={() => setIsAdding(false)}
              />
            </div>
          )}

          {questions.length === 0 && !isAdding && (
            <div className="text-center py-24 bg-white rounded-lg border border-dashed border-[#D1D7DC]">
              <div className="w-16 h-16 bg-[#F5F7F8] rounded-full flex items-center justify-center mx-auto mb-6 text-[#D1D7DC]">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-semibold text-[#1F1F1F] mb-2">No items in this practice yet</h3>
              <p className="text-[#636363] text-sm max-w-xs mx-auto mb-8">Start by adding your first question to help students test their knowledge.</p>
              <button
                onClick={() => setIsAdding(true)}
                className="bg-[#0056D2] text-white font-bold text-sm px-8 py-3 rounded hover:bg-[#00419E] transition-all"
              >
                + CREATE FIRST ITEM
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}