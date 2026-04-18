import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User, ClipboardList, ArrowRight, AlertCircle, Clock, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import { StudentService, type Question } from '../services/studentService';

const TakeTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // attemptId is persisted in localStorage (set by AccessTest)
  // Not needed for submit - we use testId from URL
  
  const [step, setStep] = useState<'welcome' | 'exam'>('welcome');
  const [studentInfo, setStudentInfo] = useState({ name: '', studentId: '' });
  const [error, setError] = useState<string | null>(null);

  // Auto-fill student name if passed from LandingPage
  useEffect(() => {
    if (location.state?.studentName) {
      setStudentInfo(prev => ({ ...prev, name: location.state.studentName }));
    }
  }, [location.state]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [testData, setTestData] = useState<Question | null>(null);

  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setIsLoading(true);
        const data = await StudentService.getAllQuestions(Number(id));
        setTestData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load test:", err);
        setError("Could not load test details. Please make sure the test exists.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTestData();
    }
  }, [id]);

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInfo.name.trim()) {
      setError("Please enter your full name to start the test.");
      return;
    }
    setError(null);
    setStep('exam');
  };

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    const isConfirmed = window.confirm("Are you sure you want to submit the test? You cannot change your answers after submission.");
    if (!isConfirmed) return;

    const answersArray = Object.entries(answers).map(([qId, oId]) => ({
      questionId: Number(qId),
      selectedOptionId: oId   // BE-9.1 expects selectedOptionId
    }));

    try {
      setIsLoading(true);
      // BE-9.1: POST /student/tests/{testId}/submit
      const result = await StudentService.submitTestAnswer(Number(id), answersArray);
      // Navigate to result page with the attemptId returned by backend
      navigate(`/results/${result.attemptId}`);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        alert("You have already submitted this test.");
      } else {
        alert("Failed to submit the test. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !testData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-primary font-bold animate-pulse">Loading test details...</div>
      </div>
    );
  }

  if (error && !testData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <span className="font-medium">{error}</span>
        </div>
      </div>
    );
  }

  if (step === 'welcome' && testData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {/* Header Trang Chờ */}
            <div className="bg-primary p-8 text-white text-center">
              <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold mb-1">{testData.testTitle}</h1>
              <p className="text-blue-100 text-sm opacity-90">{testData.testDescription}</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                  <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">Duration</span>
                  <span className="text-slate-900 font-bold">60 mins</span> {/* Hardcoded duration until added to backend */}
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <BookOpen className="w-5 h-5 text-primary mx-auto mb-2" />
                  <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">Questions</span>
                  <span className="text-slate-900 font-bold">{testData.totalQuestions} items</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleStartExam} className="space-y-4">
                {/* Only show name input if not already provided, or show as read-only/pre-filled */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={studentInfo.name}
                      onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Student ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. STU12345"
                    value={studentInfo.studentId}
                    onChange={(e) => setStudentInfo({ ...studentInfo, studentId: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  Start Examination
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exam Step
  const answeredCount = Object.keys(answers).length;
  const questionsList = testData?.questions || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{testData?.testTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Student: <span className="font-bold text-slate-700">{studentInfo.name}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Progress</div>
              <div className="font-bold text-primary">{answeredCount} of {testData?.totalQuestions} answered</div>
            </div>
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl font-mono font-bold">
              60:00
            </div>
          </div>
        </header>
        
        <div className="space-y-6">
          {questionsList.map((q, index) => (
            <div key={q.id} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  <span className="text-primary mr-2">Question {index + 1}.</span>
                  {q.questionText}
                </h2>
                <span className="bg-slate-100 text-slate-600 text-sm font-bold px-3 py-1 rounded-lg shrink-0">
                  {q.points} pkt
                </span>
              </div>

              <div className="space-y-3">
                {q.options.map(opt => {
                  const isSelected = answers[q.id] === opt.id;
                  return (
                    <div 
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-blue-50/50' 
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="shrink-0 text-primary">
                        {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-slate-300" />}
                      </div>
                      <span className={`text-base ${isSelected ? 'font-medium text-slate-900' : 'text-slate-700'}`}>
                        {opt.optionText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
