import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Try to get display name from user object (supports various shapes)
  const displayName: string =
    user?.name ?? user?.username ?? user?.fullName ?? user?.email ?? 'Teacher';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto h-full px-6 md:px-10 flex items-center justify-between">

        {/* Logo / App name */}
        <Link
          to="/teacher/dashboard"
          className="flex items-center gap-2.5 group"
          aria-label="Go to dashboard"
        >
          <div className="bg-[#0056D2] p-1.5 rounded-lg group-hover:bg-[#00419E] transition-colors">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800 select-none">
            Edu<span className="text-[#0056D2]">Exam</span>
          </span>
        </Link>

        {/* Right side: user name + logout */}
        <div className="flex items-center gap-3">
          {/* Display name */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
            <div className="h-8 w-8 rounded-full bg-blue-50 text-[#0056D2] flex items-center justify-center shrink-0">
              <User size={15} />
            </div>
            <span className="font-medium max-w-[160px] truncate" title={displayName}>
              {displayName}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-5 w-px bg-slate-200" />

          {/* Logout button */}
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            aria-label="Logout"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
