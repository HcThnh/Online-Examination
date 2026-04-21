import { Routes, Route } from 'react-router-dom';
import AuthLayout from './components/common/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import TakeTest from './pages/TakeTest';
import CreateTest from './pages/CreateTest';
import EditTest from './pages/EditTest';
import TeacherDashboard from './pages/TeacherDashboard';
import Result from './pages/Result';
import DetailResult from './pages/DetailResult';
import AccessTest from './pages/AccessTest';
import ViewClassResult from './pages/ViewClassResult';
import ChangePassword from './pages/ChangePassword';
import QuestionAnalysisScreen from './pages/QuestionAnalysisScreen';
import TeacherLayout from './components/common/TeacherLayout';
import LandingPage from './pages/LandingPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

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
      <Route path="/my-results" element={<Result />} />
      <Route path="/results/:attemptId" element={<DetailResult />} />
      <Route path="/access-test" element={<AccessTest />} />

      {/* Teacher Routes — protected, shows AppHeader */}
      <Route element={<TeacherLayout />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/create-test" element={<CreateTest />} />
        <Route path="/teacher/change-password" element={<ChangePassword />} />
        <Route path="/dashboard/tests/:testId/edit" element={<EditTest />} />
        <Route path="/dashboard/tests/:testId/results" element={<ViewClassResult />} />
        <Route path="/dashboard/tests/:testId/question-analysis" element={<QuestionAnalysisScreen />} />
      </Route>

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