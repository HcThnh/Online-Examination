import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Simple Header */}
      <header className="p-4 md:px-8 flex items-center border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg group-hover:bg-primary-hover transition-colors">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            Edu<span className="text-primary">Exam</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50/50">
        <div className="w-full max-w-[500px]">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Modern Subtle Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs font-medium text-slate-400 tracking-wide">
          &copy; {new Date().getFullYear()} EduExam. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AuthLayout;
