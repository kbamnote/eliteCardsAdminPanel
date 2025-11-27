import React, { useState } from 'react';
import { submitInquiry } from '../../utils/Api';

const InquiryForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
    setSuccess(false);

    try {
      const response = await submitInquiry(formData);
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          message: ''
        });
        // Hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
      
      {success && (
        <div className="mb-4 p-4 bg-green-500 text-white rounded-lg">
          Inquiry submitted successfully! We'll get back to you soon.
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-500 text-white rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-400 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-[#0f0f1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-[#0f0f1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email address"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-[#0f0f1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 bg-[#0f0f1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your message"
          ></textarea>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Inquiry'}
        </button>
      </form>
    </div>
  );
};

export default InquiryForm;