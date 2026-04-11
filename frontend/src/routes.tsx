import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './components/common/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import TakeTest from './pages/TakeTest';
import CreateTest from './pages/CreateTest';
import EditTest from './pages/EditTest';
import {TeacherDashboard} from './pages/TeacherDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/test/:id" element={<TakeTest />} />

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/teacher/create-test" element={<CreateTest />} />
      <Route path="/dashboard/tests/:testId/edit" element={<EditTest />} />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 Page */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
          <p className="text-slate-600 mb-8">Page not found</p>
          <a href="/login" className="text-primary font-bold hover:underline">Go back to Login</a>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;
