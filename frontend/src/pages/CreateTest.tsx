import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestService } from '../services/teacherTestService';
import { Loader2, ArrowLeft, KeyRound, Type, FileText, AlertCircle } from 'lucide-react';

const CreateTest: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', passcode: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.passcode.trim()) {
      setError('Title and passcode are required.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const data = await TestService.createTest(formData);
      // Assuming the backend returns the created object holding the test 'id'
      navigate(`/dashboard/tests/${data?.id}/edit`);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409 || err.response?.data?.message?.toLowerCase().includes('passcode')) {
         setError('This passcode is already taken or invalid. Please choose another one.');
      } else {
         setError(err.response?.data?.message || 'An error occurred while creating the test. Passcode might be taken.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/teacher/dashboard')}
          className="flex items-center gap-2 
          text-slate-500 hover:text-primary transition-colors font-bold text-sm mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create New Test</h1>
            <p className="mt-2 text-slate-500">Design a new assessment and set a secure passcode.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <span className="font-medium text-sm leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Title <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Midterm Examination"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:ring-4 focus:ring-primary/10 transition-all placeholder:font-normal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide any instructions or context for this test..."
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-medium focus:ring-4 focus:ring-primary/10 transition-all min-h-[120px] resize-y placeholder:font-normal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Passcode <span className="text-red-500">*</span></label>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text"
                  required
                  value={formData.passcode}
                  onChange={e => setFormData({ ...formData, passcode: e.target.value })}
                  placeholder="e.g. MATH2024"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-mono font-bold text-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:font-sans placeholder:font-normal"
                />
              </div>
              <p className="text-xs text-slate-400 ml-1 mt-1 font-medium">Students will need this code to access the test.</p>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed 
                disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Creating Test...</>
                ) : 'Create Test'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTest;
