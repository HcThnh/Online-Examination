import React from 'react';
import { Link } from 'react-router-dom';
import TestStatisticsPanel from '../components/teacher/TestStatisticsPanel';
import { BarChart2 } from 'lucide-react';

// Temporary page for UI testing
const TestUIPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">UI Tester: FE-13.1 & FE-14.1</h1>
            <p className="text-slate-500">Live preview of the new Teacher components using mock data.</p>
          </div>
          
          <Link 
            to="/dashboard/tests/mock-123/question-analysis"
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-primary hover:text-primary px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm text-slate-700"
          >
            <BarChart2 size={18} />
            View Question Analysis (Task 14)
          </Link>
        </div>
        
        {/* Render the Statistics Panel with Mock Data */}
        <TestStatisticsPanel testId="mock-123" useMockData={true} />
      </div>
    </div>
  );
};

export default TestUIPage;
