import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { register as registerApi } from '../services/authService';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole] = useState<'teacher'>('teacher');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords mismatch';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) {
      const newErrors = { ...errors };
      delete newErrors[e.target.id];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      await registerApi({
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userRole.toUpperCase()
      });
      navigate('/login', { state: { message: 'Registration successful!' } });
    } catch (err: any) {
      setErrors({ server: err.response?.data?.message || 'Registration failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="mb-2">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Teacher Registration</h1>
        <p className="text-slate-500 text-sm">Join the community of professional educators</p>
      </div>

      {errors.server && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errors.server}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
          <div className="relative">
            <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.name ? 'text-red-400' : 'text-slate-400'}`} />
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
              placeholder="John Doe"
            />
          </div>
          {errors.name && <p className="text-sm text-red-500 ml-1">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email address</label>
          <div className="relative">
            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.email ? 'text-red-400' : 'text-slate-400'}`} />
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="text-sm text-red-500 ml-1">{errors.email}</p>}
        </div>

        {/* Password Fields stacked vertically */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.password ? 'text-red-400' : 'text-slate-400'}`} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className={`block w-full pl-12 pr-10 py-3.5 bg-slate-50 border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400'}`} />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {(errors.password || errors.confirmPassword) && (
          <p className="text-sm text-red-500 ml-1">{errors.password || errors.confirmPassword}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-4 px-4 mt-2 rounded-2xl shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary-hover transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          {isLoading ? 'Creating Account...' : 'Create Teacher Account'}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-primary hover:underline underline-offset-4 decoration-2">
            Log in here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
