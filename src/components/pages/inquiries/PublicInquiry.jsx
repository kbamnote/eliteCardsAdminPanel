import React from 'react';
import InquiryForm from '../../common/InquiryForm';

const PublicInquiry = () => {
  return (
    <div className="min-h-screen bg-[#0f0f1a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-gray-400">
            Have questions or feedback? Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>
        
        <InquiryForm />
        
        <div className="mt-10 bg-[#1a1a2e] rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-blue-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-1">Phone</h3>
              <p className="text-gray-400">+1 (555) 123-4567</p>
            </div>
            
            <div className="text-center">
              <div className="text-blue-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-1">Email</h3>
              <p className="text-gray-400">info@eliteassociate.in</p>
            </div>
            
            <div className="text-center">
              <div className="text-blue-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-1">Office</h3>
              <p className="text-gray-400">123 Business Street<br />City, State 12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicInquiry;