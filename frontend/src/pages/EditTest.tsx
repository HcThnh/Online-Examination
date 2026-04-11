import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, ArrowLeft, CheckCircle2,
  ChevronUp, ChevronDown, Loader2, Edit3, X,
  FileText, Award
} from 'lucide-react';
import { QuestionService, type Question } from '../services/teacherQuestion';

const EditTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [testTitle,] = useState("Midterm Examination");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (testId) {
          const data = await QuestionService.getQuestions(testId);
          setQuestions(data?.sort((a, b) => a.displayOrder - b.displayOrder) || []);
        }
      } catch (err) {
        console.error("Failed to load questions", err);
        showNotification("Failed to load questions from server.", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [testId]);

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.point) || 0), 0);

  const handleSaveQuestion = async (q: Question) => {
    // Validation
    if (!q.questionText.trim()) {
      showNotification("Please enter the question content.", "error");
      return;
    }
    if (!q.options.some(opt => opt.isCorrect)) {
      showNotification("Please mark at least one option as correct.", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (testId) {
        // 1. Loại bỏ ID tạm thời của options
        const sanitizedOptions = q.options.map(opt => {
          if (opt.id < 0) {
            const { id, ...rest } = opt;
            return rest;
          }
          return opt;
        });

        // 2. Tách ID của câu hỏi ra, phần còn lại (rest) đưa vào questionDataWithoutId
        const { id: questionId, ...questionDataWithoutId } = q;

        // 3. Gom lại thành payload sạch sẽ (không chứa id tạm)
        const payloadToSave = {
          ...questionDataWithoutId,
          options: sanitizedOptions
        };

        if (q.id < 0) {
          // Gửi POST tạo mới
          await QuestionService.createQuestion(testId, payloadToSave as any);
          showNotification("Question created successfully!", "success");
        } else {
          // Gửi PUT cập nhật
          await QuestionService.updateQuestion(testId, q.id.toString(), payloadToSave as any);
          showNotification("Question updated successfully!", "success");
        }

        // Fetch lại data 
        const data = await QuestionService.getQuestions(testId);
        setQuestions(data?.sort((a, b) => a.displayOrder - b.displayOrder) || []);
        setEditingId(null);
      }
    } catch (err: any) {
      // In lỗi chi tiết ra console để dễ debug nếu backend vẫn báo lỗi
      console.error("API Error:", err.response?.data || err.message);
      showNotification("Failed to save the question. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const moveQuestion = async (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    // Đảo displayOrder
    const tempOrder = newQuestions[index].displayOrder;
    newQuestions[index].displayOrder = newQuestions[targetIndex].displayOrder;
    newQuestions[targetIndex].displayOrder = tempOrder;

    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    setQuestions(newQuestions);

    // TODO: Call API to persist reorder (e.g., PUT /api/teacher/tests/{testId}/questions/reorder)
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      if (testId && id > 0) {
        await QuestionService.deleteQuestion(testId, id.toString());
      }
      setQuestions(questions.filter(q => q.id !== id));
      showNotification("Question deleted.", "success");
    } catch (error) {
      console.error(error);
      showNotification("Failed to delete question.", "error");
    }
  }

  const handleCancelEdit = (qId: number) => {
    // Nếu đang edit câu hỏi mới (chưa lưu), hủy sẽ xóa luôn khỏi state
    if (qId < 0) {
      setQuestions(questions.filter(item => item.id !== qId));
    }
    setEditingId(null);
  };

  const startNewQuestion = () => {
    const newQ: Question = {
      id: -Date.now(), // ID tạm thời
      questionText: '',
      point: 1,
      displayOrder: questions.length + 1,
      options: [
        { id: -1, optionText: '', isCorrect: true, displayOrder: 1 },
        { id: -2, optionText: '', isCorrect: false, displayOrder: 2 },
        { id: -3, optionText: '', isCorrect: false, displayOrder: 3 },
        { id: -4, optionText: '', isCorrect: false, displayOrder: 4 }
      ]
    };
    setQuestions([...questions, newQ]);
    setEditingId(newQ.id);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-medium font-mono text-sm">LOADING BUILDER...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-20 right-8 z-50 px-6 py-3 rounded-xl shadow-lg font-bold text-sm transform transition-all animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </button>
          <div className="h-6 w-[1px] bg-slate-200" />
          <div>
            <h1 className="text-xl font-black text-slate-900">{testTitle || "Assessment Settings"}</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#fcfdfe]">
          <div className="max-w-4xl mx-auto space-y-10">
            {questions.map((q, index) => (
              <div key={q.id} className="scroll-mt-24">
                {editingId === q.id ? (
                  /* EDITING MODE */
                  <div className="bg-white rounded-[2rem] border-2 border-primary shadow-2xl shadow-primary/5 p-8 md:p-10 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-tighter">Question {index + 1}</span>
                        <div className="h-1 w-1 bg-slate-300 rounded-full" />
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Editor Mode</span>
                      </div>
                      <button onClick={() => handleCancelEdit(q.id)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Content</label>
                          <textarea
                            className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-slate-900 font-bold text-lg focus:ring-4 focus:ring-primary/10 focus:border-primary min-h-[120px] transition-all"
                            value={q.questionText}
                            onChange={(e) => {
                              const newQs = [...questions];
                              newQs[index].questionText = e.target.value;
                              setQuestions(newQs);
                            }}
                            placeholder="Type your question here..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Point Weight</label>
                          <div className="relative group">
                            <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                            <input
                              type="number"
                              min="0"
                              className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-5 pl-12 font-black text-primary text-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                              value={q.point}
                              onChange={(e) => {
                                const newQs = [...questions];
                                newQs[index].point = parseInt(e.target.value) || 0;
                                setQuestions(newQs);
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Answer Options & Correct Key</label>
                        <div className="grid gap-3">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className={`flex items-center gap-4 p-2 rounded-2xl border transition-all ${opt.isCorrect ? 'border-green-200 bg-green-50' : 'border-slate-200/60 bg-white hover:border-slate-300'}`}>
                              <button
                                onClick={() => {
                                  const newQs = [...questions];
                                  newQs[index].options = newQs[index].options.map(o => ({ ...o, isCorrect: false }));
                                  newQs[index].options[optIdx].isCorrect = true;
                                  setQuestions(newQs);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${opt.isCorrect ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-slate-100 text-slate-300 hover:text-slate-500 hover:bg-slate-200'}`}
                              >
                                {opt.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                              </button>
                              <input
                                className="flex-1 bg-transparent border-none rounded-xl py-3 px-2 text-sm font-bold text-slate-700 placeholder-slate-300 focus:ring-0"
                                value={opt.optionText}
                                onChange={(e) => {
                                  const newQs = [...questions];
                                  newQs[index].options[optIdx].optionText = e.target.value;
                                  setQuestions(newQs);
                                }}
                                placeholder={`Input option ${optIdx + 1}...`}
                              />
                              <button 
                                  onClick={() => {
                                      const newQs = [...questions];
                                      newQs[index].options.splice(optIdx, 1);
                                      setQuestions(newQs);
                                  }}
                                  className="p-2 mr-2 text-slate-300 hover:text-red-500 transition-colors"
                                  title="Remove option"
                              >
                                  <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                        <button
                          onClick={() => {
                            const newQs = [...questions];
                            newQs[index].options.push({
                              id: -(Date.now() + Math.random()), // Đảm bảo ID tạm luôn duy nhất
                              optionText: '',
                              isCorrect: false,
                              displayOrder: newQs[index].options.length + 1
                            });
                            setQuestions(newQs);
                          }}
                          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-primary transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> ADD NEW OPTION
                        </button>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleCancelEdit(q.id)}
                            className="px-6 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl cursor-pointer">
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveQuestion(q)}
                            disabled={isSaving}
                            className="px-10 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                          >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {q.id < 0 ? 'Create Question' : 'Update Question'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PREVIEW CARD */
                  <div className="group relative bg-white rounded-[1.5rem] p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/30 transition-all duration-300 cursor-pointer" onClick={() => setEditingId(q.id)}>
                    <div className="absolute right-6 top-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => { e.stopPropagation(); moveQuestion(index, 'up'); }} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg"><ChevronUp size={16} /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveQuestion(index, 'down'); }} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg"><ChevronDown size={16} /></button>
                      <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(q.id); }} className="p-2 bg-slate-100 text-slate-600 hover:bg-primary hover:text-white rounded-lg transition-all"><Edit3 size={16} /></button>
                      <button onClick={(e) => handleDelete(e, q.id)} className="p-2 bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>

                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-black text-slate-400 text-sm border border-slate-100">
                          {q.displayOrder || (index + 1)}
                        </div>
                        <div className="h-full w-[2px] bg-slate-50 flex-1 min-h-[40px] rounded-full" />
                      </div>

                      <div className="flex-1 pr-12">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-slate-900 text-[9px] font-black text-white px-2 py-0.5 rounded tracking-[0.2em] uppercase">PKT: {q.point}</span>
                          <span className="text-slate-300 font-bold text-[9px] uppercase tracking-widest">Multiple Choice</span>
                        </div>
                        <h3 className="text-slate-800 font-bold text-xl mb-6 leading-relaxed">{q.questionText || "Untitled Question"}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${opt.isCorrect ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                              <div className={`w-2 h-2 rounded-full ${opt.isCorrect ? 'bg-green-500' : 'bg-slate-200'}`} />
                              <span className={`text-sm font-bold ${opt.isCorrect ? 'text-green-700' : 'text-slate-500'}`}>{opt.optionText || '(Empty option)'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Question Button (Ẩn nếu đang chỉnh sửa một câu hỏi mới tạo) */}
            {(!editingId || editingId > 0) && (
              <button
                onClick={startNewQuestion}
                className="w-full py-16 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-4 group shadow-sm hover:shadow-xl"
              >
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all rotate-3 group-hover:rotate-0">
                  <Plus className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-widest">Add New Question</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">Select multiple choice or short answer</p>
                </div>
              </button>
            )}
          </div>
        </main>

        {/* Right Sidebar: Summary Stats */}
        <aside className="hidden xl:flex w-80 flex-col p-8 border-l border-slate-200 bg-white gap-8 overflow-y-auto">
          <div className="space-y-6">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Test Summary</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <Award className="w-5 h-5 text-primary mb-3" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Points</p>
                <p className="text-2xl font-black text-slate-900">{totalPoints}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <FileText className="w-5 h-5 text-purple-500 mb-3" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</p>
                <p className="text-2xl font-black text-slate-900">{questions.length}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EditTest;