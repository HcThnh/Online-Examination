// TeacherDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, KeyRound, Clock } from 'lucide-react';
import { TestService, type TestItem } from '../services/testService';

export const TeacherDashboard: React.FC = () => {
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

  const handleCreateTest = () => {
    navigate('/dashboard/tests/new');
  };

  const handleEditTest = (testId: string) => {
    navigate(`/dashboard/tests/${testId}/edit`);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Tests</h1>
            <p className="mt-1 text-gray-500 text-sm">Manage your online assessments and quizzes</p>
          </div>
          <button
            onClick={handleCreateTest}
            className="mt-4 md:mt-0 flex items-center 
            justify-center gap-2 bg-blue-600 hover:bg-blue-700 
            text-white px-5 py-2.5 rounded-md font-medium transition-colors shadow-sm
            cursor-pointer"
          >
            <Plus size={18} />
            Create New Test
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Create your first test to start assessing your students online.
            </p>
            <button
              onClick={handleCreateTest}
              className="flex items-center gap-2 bg-blue-600 
              hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium transition-colors 
              shadow-sm cursor-pointer"
            >
              <Plus size={18} />
              Create your first test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test.id}
                onClick={() => handleEditTest(test.id)}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer relative flex flex-col"
              >
                <div className="flex justify-between items-start mb-4 pr-8">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-blue-700 transition-colors line-clamp-2">
                    {test.title}
                  </h3>
                  
                  <button
                    onClick={(e) => handleDeleteTest(e, test.id)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Delete test"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <KeyRound size={16} className="text-blue-600" />
                      Passcode:
                    </span>
                    <span className="bg-gray-100 px-2.5 py-0.5 rounded font-mono text-gray-800 tracking-wider">
                      {test.passcode}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <FileText size={16} />
                      {test.questionCount} {test.questionCount === 1 ? 'question' : 'questions'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} />
                      {formatDate(test.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;