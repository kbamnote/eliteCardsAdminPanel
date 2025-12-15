import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Eye, Trash2, Mail } from 'lucide-react';
import DeleteModal from '../../common/DeleteModal';
import MailModal from '../../common/MailModal';
import { 
  allStudents, 
  deleteStudentProfile,
  getStudentProfile
} from '../../../utils/Api';

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [studentToMail, setStudentToMail] = useState(null);
  const navigate = useNavigate();

  // Fetch students from the API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await allStudents();
        if (response.data.success) {
          setStudents(response.data.data);
        } else {
          setError('Failed to fetch students');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Error fetching students: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  const openDeleteModal = (studentId, studentName) => {
    setStudentToDelete({ id: studentId, name: studentName });
    setDeleteModalOpen(true);
    // Clear any previous messages when opening the modal
    setError('');
    setSuccessMessage('');
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setStudentToDelete(null);
  };

  const openMailModal = (studentId = null) => {
    setStudentToMail(studentId);
    setMailModalOpen(true);
    // Clear any previous messages when opening the modal
    setError('');
    setSuccessMessage('');
  };

  const closeMailModal = () => {
    setMailModalOpen(false);
    setStudentToMail(null);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    const { id: studentId, name: studentName } = studentToDelete;
    
    try {
      // Finally, delete the student account (user and profile)
      const response = await deleteStudentProfile(studentId);
      
      if (response.data.success) {
        // Remove the student from the state
        setStudents(students.filter(student => (student._id || student.userId || student.id) !== studentId));
        // Show success message
        setSuccessMessage(`${studentName}'s account and all associated data deleted successfully`);
        // Clear any previous error
        setError('');
      } else {
        setError('Failed to delete student: ' + response.data.message);
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      setError('Error deleting student: ' + (error.response?.data?.message || error.message));
      setSuccessMessage('');
    } finally {
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6 mt-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Users className="h-6 w-6 text-green-500 mr-2" />
          <h2 className="text-2xl font-bold text-white">All Students</h2>
        </div>
        
        <div className="flex gap-2">
          {/* Mail All Button */}
          <button
            onClick={() => openMailModal()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>Mail All</span>
          </button>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-500 text-white p-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && !deleteModalOpen && (
        <div className="mb-4 bg-red-500 text-white p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const studentId = student._id || student.userId || student.id;
                return (
                  <tr key={studentId} className="hover:bg-[#0f0f1a]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{student.fullName || 'Unnamed Student'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300 font-mono">{studentId || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{student.email || student.userId?.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Mail Button */}
                        <button 
                          onClick={() => openMailModal(studentId)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Send Mail"
                        >
                          <Mail className="h-5 w-5" />
                        </button>
                        
                        <button 
                          onClick={() => handleViewDetails(studentId)}
                          className="text-green-400 hover:text-green-300"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(studentId, student.fullName || 'this student')}
                          className="text-red-400 hover:text-red-300"
                          title="Delete Student"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteStudent}
        itemName={studentToDelete?.name || 'this student'}
      />
      
      <MailModal
        showModal={mailModalOpen}
        setShowModal={closeMailModal}
        clientId={studentToMail}
      />
    </div>
  );
};

export default AllStudents;