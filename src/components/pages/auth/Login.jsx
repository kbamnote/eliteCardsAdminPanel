import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Cookies from 'js-cookie';
import { login } from '../../../utils/Api';
import logo from '../../../assets/br-logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call the actual login API
      const response = await login({ email, password });
      
      // Check if login was successful
      if (response.data.success) {
        // Check if the user is an admin
        if (response.data.data.user.role === 'admin') {
          // Set cookies for admin user
          Cookies.set('token', response.data.data.token, { expires: 7 });
          Cookies.set('userRole', response.data.data.user.role, { expires: 7 });
          
          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          // Not an admin user
          setError('Access denied. Admin privileges required.');
          // Remove any tokens that might have been set
          Cookies.remove('token');
          Cookies.remove('userRole');
        }
      } else {
        setError(response.data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        setError(err.response.data.message || 'Invalid credentials. Please try again.');
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-16 w-16" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Elite Cards Admin</h2>
          <p className="mt-2 text-sm text-gray-400">Sign in to your admin account</p>
        </div>

        <div className="mt-8 bg-[#1a1a2e] py-8 px-6 shadow rounded-lg">
          {error && (
            <div className="mb-4 bg-red-500 text-white p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0f0f1a] text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#0f0f1a] text-white block w-full pl-10 pr-10 py-3 border border-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-300"
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;