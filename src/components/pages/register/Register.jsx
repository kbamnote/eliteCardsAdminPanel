import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { signup } from '../../../utils/Api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' // Default to client
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // Check if email is provided
    if (!formData.email) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    
    // Check if password is provided
    if (!formData.password) {
      setError('Password is required');
      setLoading(false);
      return;
    }
    
    // Check if role is provided
    if (!formData.role) {
      setError('Role is required');
      setLoading(false);
      return;
    }
    
    try {
      // Call the actual signup API with role
      const response = await signup({
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      if (response.data.success) {
        setSuccess(true);
        
        // Redirect to clients list after a short delay
        setTimeout(() => {
          navigate('/all-clients');
        }, 2000);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        setError(err.response.data.message || 'Registration failed');
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('An error occurred during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-[#1a1a2e] py-8 px-6 shadow rounded-lg">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
            <p className="text-gray-400 mb-6">The new {formData.role} has been registered successfully.</p>
            <p className="text-gray-400">Redirecting to clients list...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] px-4 py-12">
      <div className="max-w-md w-full">

        <div className="bg-[#1a1a2e] py-8 px-6 shadow rounded-lg">
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
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-[#0f0f1a] text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="john@example.com"
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
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-[#0f0f1a] text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-[#0f0f1a] text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                Role
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="bg-[#0f0f1a] text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="client">Client</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              <p>Note: After registration, the {formData.role} can update their profile with additional information.</p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Registering...' : `Register ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;