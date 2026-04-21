// src/pages/LandingPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, KeyRound, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccessResponse {
  token: string;
  testId: number;
  testTitle: string;
  studentId: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseTokenRole = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.role ?? payload?.roles?.[0] ?? null;
  } catch {
    return null;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const passcodeRef = useRef<HTMLInputElement>(null);

  const [passcode, setPasscode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guard: nếu teacher đã login → redirect thẳng vào dashboard
    const token = localStorage.getItem('token');
    if (token) {
      const role = parseTokenRole(token);
      if (role === 'TEACHER' || role === 'ROLE_TEACHER') {
        navigate('/teacher/dashboard', { replace: true });
        return;
      }
    }
    passcodeRef.current?.focus();
  }, [navigate]);

  const isFormValid = passcode.trim().length > 0 && studentName.trim().length > 0;

  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post<AccessResponse>(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/student/access`,
        {
          passcode: passcode.trim(),
          studentName: studentName.trim(),
        }
      );

      const { token, testId } = response.data;
      localStorage.setItem('token', token);
      navigate(`/student/test/${testId}`, { state: { studentName: studentName.trim() } });

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400 || status === 403 || status === 404) {
          setError('Invalid passcode. Check with your teacher.');
        } else {
          setError('Server connection failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !isFormValid || isLoading;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">

      {/* ── Public header ─────────────────────────────────────────────────── */}
      <header className="w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          {/* Logo — not clickable (already on /) */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="bg-[#0056D2] p-1.5 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">
              Edu<span className="text-[#0056D2]">Exam</span>
            </span>
          </div>

          {/* Teacher login button */}
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-[#0056D2] border border-[#0056D2]/40 px-4 py-2 rounded-xl hover:bg-[#0056D2] hover:text-white transition-all cursor-pointer"
          >
            Teacher Login
          </button>
        </div>
      </header>

      {/* ── Hero section ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Headline */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#0056D2] mb-5 shadow-lg shadow-blue-500/20">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Enter your test passcode to begin
            </h1>
            <p className="mt-3 text-slate-500">
              No account needed — just your name and the code from your teacher
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
            <form onSubmit={handleStartTest} className="space-y-5" noValidate>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Passcode */}
              <div className="space-y-1.5">
                <label htmlFor="field-passcode" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Test Passcode
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    ref={passcodeRef}
                    id="field-passcode"
                    type="text"
                    autoComplete="off"
                    maxLength={20}
                    value={passcode}
                    onChange={(e) => { setPasscode(e.target.value); setError(null); }}
                    placeholder="e.g. MATH2024"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/25 focus:border-[#0056D2] transition-all"
                  />
                </div>
              </div>

              {/* Student name */}
              <div className="space-y-1.5">
                <label htmlFor="field-student-name" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="field-student-name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    value={studentName}
                    onChange={(e) => { setStudentName(e.target.value); setError(null); }}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/25 focus:border-[#0056D2] transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                id="btn-start-test"
                type="submit"
                disabled={isButtonDisabled}
                className="w-full flex items-center justify-center gap-2 bg-[#0056D2] hover:bg-[#00419E] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] mt-1 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting…
                  </>
                ) : (
                  <>
                    Start Test
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-400">
              The passcode is provided by your instructor.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;