import React, { useState, useEffect } from 'react';
import { getAllInquiries, deleteInquiry } from '../../../utils/Api';
import { Trash2, Mail } from 'lucide-react';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await getAllInquiries();
      if (response.data.success) {
        setInquiries(response.data.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch inquiries: ' + err.message);
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await deleteInquiry(id);
        // Remove the deleted inquiry from the state
        setInquiries(inquiries.filter(inquiry => inquiry._id !== id));
      } catch (err) {
        setError('Failed to delete inquiry: ' + err.message);
        console.error('Error deleting inquiry:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 text-white p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-20">
   

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Total Inquiries</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-white">{inquiries.length}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-white">Recent Inquiries</h2>
          <p className="mt-1 text-sm text-gray-400">List of all customer inquiries</p>
        </div>
        <div className="border-t border-gray-700">
          {inquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#0f0f1a]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Message
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#1a1a2e] divide-y divide-gray-700">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry._id} className="hover:bg-[#0f0f1a]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{inquiry.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">{inquiry.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">{inquiry.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400 max-w-xs truncate" title={inquiry.message}>
                          {inquiry.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(inquiry._id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-400">
              No inquiries found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inquiries;