import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Trash2, Save, ArrowLeft, CheckCircle2, Circle, 
  ChevronUp, ChevronDown, Loader2, Edit3, X, 
  LayoutDashboard, FileText, Clock, Award, MoreVertical,
  GripHorizontal, Copy
} from 'lucide-react';
import * as testService from '../services/testService';

interface Question {
  id: string;
  question_text: string;
  points: number;
  options: string[];
  correct_option: number;
}

const EditTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  const [testTitle, setTestTitle] = useState("Midterm Examination - Web Development");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initial Fetch with Mock Data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (testId) {
          const data = await testService.getQuestions(testId).catch(() => [
            { 
              id: '1', 
              question_text: 'What does HTML stand for?', 
              points: 2, 
              options: ['Hyper Text Markup Language', 'High Tech Machine Language', 'Hyperlink Text Management', 'Home Tool Markup Language'], 
              correct_option: 0 
            },
            { 
              id: '2', 
              question_text: 'Which tag is used for an unordered list?', 
              points: 1, 
              options: ['<ol>', '<ul>', '<li>', '<list>'], 
              correct_option: 1 
            }
          ]);
          setQuestions(data);
        }
      } catch (err) {
        console.error("Failed to load", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [testId]);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const handleSaveQuestion = async (q: Question) => {
    setIsSaving(true);
    try {
      if (testId) {
        if (q.id.startsWith('temp-')) {
          await testService.addQuestion(testId, q);
        } else {
          await testService.updateQuestion(testId, q.id, q);
        }
        setEditingId(null);
      }
    } catch (err) {
      alert("Error saving question");
    } finally {
      setIsSaving(false);
    }
  };

  const moveQuestion = async (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  const startNewQuestion = () => {
    const newQ: Question = {
      id: `temp-${Date.now()}`,
      question_text: '',
      points: 1,
      options: ['', '', '', ''],
      correct_option: 0
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Premium Header */}
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
            <input 
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="text-xl font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 w-full md:w-[400px] placeholder-slate-300"
              placeholder="Enter test title..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 mr-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin"/> : <CheckCircle2 className="w-3 h-3 text-green-500" />}
            {isSaving ? "Saving changes..." : "All changes saved"}
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-full transition-all shadow-xl shadow-slate-200 uppercase tracking-widest">
            <Save className="w-4 h-4" />
            Publish Test
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Quick Navigation */}
        <aside className="hidden lg:flex w-20 flex-col items-center py-8 border-r border-slate-200 bg-white gap-4">
          {questions.map((_, i) => (
            <button 
              key={i}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${editingId === questions[i].id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            onClick={startNewQuestion}
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 flex items-center justify-center border-2 border-dashed border-slate-200 transition-all mt-2"
          >
            <Plus className="w-5 h-5" />
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#fcfdfe]">
          <div className="max-w-3xl mx-auto space-y-10">
            {questions.map((q, index) => (
              <div key={q.id} className="scroll-mt-24">
                {editingId === q.id ? (
                  /* ENHANCED EDITING MODE */
                  <div className="bg-white rounded-[2rem] border-2 border-primary shadow-2xl shadow-primary/5 p-8 md:p-10 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-tighter">Question {index + 1}</span>
                        <div className="h-1 w-1 bg-slate-300 rounded-full" />
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Editor Mode</span>
                      </div>
                      <button onClick={() => setEditingId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Content</label>
                          <textarea 
                            className="w-full bg-slate-50 border-none rounded-2xl p-5 text-slate-900 font-bold text-lg focus:ring-4 focus:ring-primary/5 min-h-[120px] transition-all"
                            value={q.question_text}
                            onChange={(e) => {
                              const newQs = [...questions];
                              newQs[index].question_text = e.target.value;
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
                              className="w-full bg-slate-50 border-none rounded-2xl p-5 pl-12 font-black text-primary text-xl focus:ring-4 focus:ring-primary/5 transition-all"
                              value={q.points}
                              onChange={(e) => {
                                const newQs = [...questions];
                                newQs[index].points = parseInt(e.target.value) || 0;
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
                            <div key={optIdx} className={`flex items-center gap-4 p-2 rounded-2xl border transition-all ${q.correct_option === optIdx ? 'border-green-100 bg-green-50/30' : 'border-transparent bg-slate-50/50'}`}>
                              <button 
                                onClick={() => {
                                  const newQs = [...questions];
                                  newQs[index].correct_option = optIdx;
                                  setQuestions(newQs);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${q.correct_option === optIdx ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-slate-200 hover:text-slate-400'}`}
                              >
                                {q.correct_option === optIdx ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                              </button>
                              <input 
                                className="flex-1 bg-transparent border-none rounded-xl py-3 px-2 text-sm font-bold text-slate-700 placeholder-slate-300 focus:ring-0"
                                value={opt}
                                onChange={(e) => {
                                  const newQs = [...questions];
                                  newQs[index].options[optIdx] = e.target.value;
                                  setQuestions(newQs);
                                }}
                                placeholder={`Input option ${optIdx + 1}...`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                        <button 
                          onClick={() => {
                            const newQs = [...questions];
                            newQs[index].options.push('');
                            setQuestions(newQs);
                          }}
                          className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-primary transition-colors"
                        >
                          <Plus className="w-4 h-4" /> ADD NEW OPTION
                        </button>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setEditingId(null)} className="px-6 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl">Cancel</button>
                          <button 
                             onClick={() => handleSaveQuestion(q)}
                             className="px-10 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all"
                          >
                            Update Question
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PREMIUM PREVIEW CARD */
                  <div className="group relative bg-white rounded-[1.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-300 cursor-pointer" onClick={() => setEditingId(q.id)}>
                    <div className="absolute right-6 top-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => { e.stopPropagation(); moveQuestion(index, 'up'); }} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg"><ChevronUp size={16} /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveQuestion(index, 'down'); }} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg"><ChevronDown size={16} /></button>
                      <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(q.id); }} className="p-2 bg-slate-100 text-slate-600 hover:bg-primary hover:text-white rounded-lg transition-all"><Edit3 size={16} /></button>
                      <button onClick={(e) => { e.stopPropagation(); }} className="p-2 bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>

                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-black text-slate-400 text-sm border border-slate-100">
                          {index + 1}
                        </div>
                        <div className="h-full w-[2px] bg-slate-50 flex-1 min-h-[40px] rounded-full" />
                      </div>
                      
                      <div className="flex-1 pr-12">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-slate-900 text-[9px] font-black text-white px-2 py-0.5 rounded tracking-[0.2em] uppercase">PKT: {q.points}</span>
                          <span className="text-slate-300 font-bold text-[9px] uppercase tracking-widest">Multiple Choice</span>
                        </div>
                        <h3 className="text-slate-800 font-bold text-xl mb-6 leading-relaxed">{q.question_text || "Untitled Question"}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.filter(o => o).map((opt, i) => (
                            <div key={i} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${i === q.correct_option ? 'border-green-100 bg-green-50/50 text-green-700' : 'border-slate-50 bg-slate-50/30 text-slate-400'}`}>
                              <div className={`w-2 h-2 rounded-full ${i === q.correct_option ? 'bg-green-500' : 'bg-slate-200'}`} />
                              <span className={`text-sm font-bold ${i === q.correct_option ? 'text-green-700' : 'text-slate-500'}`}>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Premium Add Question Button */}
            <button 
              onClick={startNewQuestion}
              className="w-full py-16 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-4 group shadow-sm hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all rotate-3 group-hover:rotate-0">
                <Plus className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-widest">Add New Question</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">Select multiple choice or short answer</p>
              </div>
            </button>
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

            <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Clock size={80} />
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Estimated time</p>
                <p className="text-3xl font-black mb-1 italic">45:00</p>
                <p className="text-[10px] font-bold text-slate-500">Suggested duration</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</h3>
              <button className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-sm font-bold text-slate-700">
                <Copy className="w-4 h-4 text-slate-400" /> Duplicate Test
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-2xl transition-all text-sm font-bold text-red-600">
                <Trash2 className="w-4 h-4 text-red-400" /> Delete Test
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EditTest;