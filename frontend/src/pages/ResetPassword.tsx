import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { resetPassword as resetPasswordApi } from '../services/authService';

const ResetPassword: React.FC = () => {
  const [showPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Redirecting to forgot password...');
      setTimeout(() => navigate('/forgot-password'), 3000);
    }
  }, [token, navigate]);

  const validate = () => {
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPasswordApi({ token, new_password: formData.password });
      navigate('/login', { state: { message: 'Password reset. Please log in.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'This link is invalid or has expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error && (error.includes('expired') || error.includes('invalid'))) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 p-3 rounded-full text-red-600">
            <AlertCircle className="w-10 h-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Link Expired</h1>
        <p className="text-slate-500 mb-8">{error}</p>
        <Link 
          to="/forgot-password" 
          className="bg-primary text-white py-2 px-6 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary font-bold mb-4">
          <ShieldCheck className="w-6 h-6" />
          <span>Secure Reset</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Reset password</h1>
        <p className="text-slate-500">
          Please enter your new password below.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3 text-sm animate-pulse">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
              placeholder="Min 8 characters"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
              placeholder="Must match password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>

        <div className="text-center mt-6">
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
