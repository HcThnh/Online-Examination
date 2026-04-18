import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, KeyRound, Clock, ShieldCheck, BarChart2 } from 'lucide-react';
import { TestService, type TestItem } from '../services/teacherTestService';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      try {
        const data = await TestService.getTests();
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTests(sorted);
      } catch (error) {
        console.error('Failed to fetch tests', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTests();
  }, []);

  const handleCreateTest = () => navigate('/teacher/create-test');
  const handleEditTest = (testId: string) => {
    navigate(`/dashboard/tests/${testId}/edit`);
  };

  const handleViewResults = (e: React.MouseEvent, testId: string) => {
    e.stopPropagation();
    navigate(`/dashboard/tests/${testId}/results`);
  };

  const handleDeleteTest = async (e: React.MouseEvent, testId: string) => {
    e.stopPropagation();
    const confirmDelete = window.confirm('Are you sure you want to delete this test?');
    if (confirmDelete) {
      try {
        await TestService.deleteTest(testId);
        setTests(tests.filter((t) => t.id !== testId));
      } catch (error) {
        console.error('Failed to delete test', error);
        alert('Failed to delete the test. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <div className="max-w-6xl mx-auto w-full p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-3xl font-normal text-slate-900 mb-2">My Assessments</h1>
            <p className="text-slate-500 text-sm">Create and manage your online tests for students</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={() => navigate('/teacher/change-password')}
              className="flex items-center justify-center 
              gap-2 bg-white hover:bg-slate-50 text-slate-700 
              border border-slate-200 px-4 py-2.5 rounded 
              font-semibold transition-all shadow-sm cursor-pointer"
            >
              <ShieldCheck size={18} className="text-primary" />
              Change Password
            </button>
            <button
              onClick={handleCreateTest}
              className="flex items-center justify-center gap-2 bg-[#0056D2] hover:bg-[#00419e] text-white px-6 py-2.5 rounded font-bold transition-all shadow-sm"
            >
              <Plus size={18} />
              Create New Test
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-slate-100 border-t-[#0056D2] rounded-full animate-spin"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded p-16 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No assessments yet</h3>
            <p className="text-slate-500 mb-8 max-w-sm">Get started by creating your first online assessment.</p>
            <button
              onClick={handleCreateTest}
              className="bg-[#0056D2] hover:bg-[#00419e] text-white px-8 py-3 rounded font-bold transition-all"
            >
              Create your first test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tests.map((test) => (
              <div
                key={test.id}
                onClick={() => handleEditTest(test.id)}
                className="group bg-white border border-slate-200 rounded p-6 hover:border-[#0056D2] transition-all cursor-pointer relative flex flex-col shadow-sm"
              >
                <div className="flex justify-between items-start mb-6 pr-8">
                  <h3 className="font-semibold text-lg text-slate-900 leading-tight group-hover:text-[#0056D2] transition-colors line-clamp-2">
                    {test.title}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteTest(e, test.id)}
                    className="absolute top-6 
                    right-6 p-2 text-slate-300 hover:text-red-600 
                    hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    aria-label="Delete test"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-auto space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <KeyRound size={16} className="text-[#0056D2]" />
                      Passcode:
                    </span>
                    <span className="bg-slate-50 px-2 py-1 rounded font-mono font-bold text-slate-700">
                      {test.passcode}
                    </span>
                  </div>


                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <FileText size={16} />
                      {test.questionCount} Qs
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} />
                      {formatDate(test.createdAt)}
                    </span>
                  </div>

                  {/* View Results button */}
                  <button
                    onClick={(e) => handleViewResults(e, test.id)}
                    className="w-full flex items-center justify-center gap-2 mt-1 py-2 rounded-xl
                    border border-primary/20 text-primary text-sm font-semibold
                    hover:bg-primary hover:text-white hover:border-primary
                    transition-all cursor-pointer"
                    aria-label="View class results"
                  >
                    <BarChart2 size={15} />
                    View Results
                  </button>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-[#0056D2] transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;