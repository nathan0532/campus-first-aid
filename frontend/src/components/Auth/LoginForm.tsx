import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, User, Lock, AlertCircle, Home, Eye, EyeOff } from 'lucide-react';
import { userAPI } from '../../utils/api';
import { setAuthData } from '../../utils/auth';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await userAPI.login(formData);
      const { user, token } = response.data;
      
      setAuthData(user, token);
      
      if (onSuccess) {
        onSuccess();
      } else {
        // 获取用户原本要访问的页面，如果没有则跳转到首页
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'student' | 'admin') => {
    setIsLoading(true);
    setError('');

    try {
      const credentials = role === 'admin' 
        ? { username: 'admin', password: 'admin123' }
        : { username: 'demo', password: 'demo123' };
        
      const response = await userAPI.login(credentials);
      const { user, token } = response.data;
      
      setAuthData(user, token);
      
      if (onSuccess) {
        onSuccess();
      } else {
        // 管理员直接跳转到管理页面，普通用户跳转到之前要访问的页面
        const from = role === 'admin' 
          ? '/admin' 
          : (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError('Demo account login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Home Button */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <div>
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <LogIn className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to CERT Simulator For Teens
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
Or{' '}
            <Link
              to="/register"
              className="font-medium text-red-600 hover:text-red-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Student Demo
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Admin Demo
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500 text-center">
              Click demo accounts to experience system features directly
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;