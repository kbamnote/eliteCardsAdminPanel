import React, { useState, useEffect } from "react";
import { FaEnvelope, FaPaperPlane, FaUser, FaCheckSquare, FaSquare, FaSearch, FaPaperclip, FaTimes } from "react-icons/fa";
import { allClients, sendSingleMail, sendGroupMail } from '../../utils/Api';

const MailModal = ({ showModal, setShowModal, clientId = null }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  const [mailData, setMailData] = useState({
    subject: "",
    message: ""
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch clients
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await allClients();
      const allClientsData = response.data?.data || [];
      
      setClients(allClientsData);
      setFilteredClients(allClientsData);
      
      // If a specific client ID is provided, pre-select that client
      if (clientId) {
        setSelectedClients([clientId]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setErrorMessage("Failed to load clients. Please try again.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      fetchClients();
    }
  }, [showModal, clientId]);

  // Filter clients based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client => 
        (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.profession && client.profession.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle client selection
  const toggleClientSelection = (clientId) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(client => client._id || client.userId || client.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle file attachment
  const handleFileAttachment = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  };

  // Send mail
  const handleSendMail = async (e) => {
    e.preventDefault();
    
    if (selectedClients.length === 0) {
      setErrorMessage("Please select at least one client to send mail");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    if (!mailData.subject.trim() || !mailData.message.trim()) {
      setErrorMessage("Please fill in both subject and message");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    setSending(true);
    setShowError(false);
    
    try {
      // Create FormData
      const formData = new FormData();
      
      // Add mail data
      formData.append('subject', mailData.subject);
      formData.append('message', mailData.message);
      
      // Add client IDs
      if (selectedClients.length === 1) {
        // Single mail
        formData.append('clientId', selectedClients[0]);
      } else {
        // Group mail
        selectedClients.forEach((id, index) => {
          formData.append(`clientIds[${index}]`, id);
        });
      }
      
      // Add attachments
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      // Send mail
      if (selectedClients.length === 1) {
        await sendSingleMail(formData);
      } else {
        await sendGroupMail(formData);
      }
      
      // Reset form
      setMailData({
        subject: "",
        message: ""
      });
      setSelectedClients([]);
      setSelectAll(false);
      setAttachments([]);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error sending mail:", error);
      setErrorMessage(error.response?.data?.message || "Failed to send mail. Please try again.");
      setShowError(true);
    } finally {
      setSending(false);
    }
  };

  // Get client name
  const getClientName = (client) => {
    return client.name || client.email || 'Unnamed Client';
  };

  // Get client email
  const getClientEmail = (client) => {
    return client.email || 'No email';
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaEnvelope className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">
              Send Email to Clients
            </h3>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6">
            {/* Success/Error Messages */}
            {showSuccess && (
              <div className="bg-green-500 border border-green-600 text-white px-4 py-3 rounded-lg mb-6">
                Email sent successfully to {selectedClients.length} client(s)!
              </div>
            )}
            
            {showError && (
              <div className="bg-red-500 border border-red-600 text-white px-4 py-3 rounded-lg mb-6">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mail Composition Panel */}
              <div className="lg:col-span-1">
                <div className="bg-[#0f0f1a] rounded-lg p-5 border border-gray-700">
                  <h2 className="text-lg font-bold text-white mb-4">Compose Email</h2>
                  
                  <form onSubmit={handleSendMail}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={mailData.subject}
                          onChange={handleInputChange}
                          placeholder="Enter email subject"
                          className="w-full px-3 py-2 bg-[#1a1a2e] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={mailData.message}
                          onChange={handleInputChange}
                          placeholder="Enter your message here..."
                          rows="4"
                          className="w-full px-3 py-2 bg-[#1a1a2e] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-white"
                          required
                        />
                      </div>
                      
                      {/* File Attachment */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Attachments
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 px-3 py-2 bg-[#1a1a2e] border border-gray-600 rounded-lg cursor-pointer hover:bg-[#2a2a3e] transition-colors">
                            <div className="flex items-center gap-2">
                              <FaPaperclip className="text-gray-400" />
                              <span className="text-gray-300 text-sm">
                                {attachments.length > 0 ? `${attachments.length} file(s) selected` : 'Choose files...'}
                              </span>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              multiple
                              onChange={handleFileAttachment}
                              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                            />
                          </label>
                        </div>
                        
                        {/* Attachment Preview */}
                        {attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-[#1a1a2e] p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <FaPaperclip className="text-gray-400 text-xs" />
                                  <span className="text-gray-300 text-xs truncate max-w-[120px]">{file.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <FaTimes className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={sending || selectedClients.length === 0}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          sending || selectedClients.length === 0
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
                        }`}
                      >
                        {sending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="w-4 h-4" />
                            Send Email to {selectedClients.length} Client(s)
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              
              {/* Clients Selection Panel */}
              <div className="lg:col-span-2">
                <div className="bg-[#0f0f1a] rounded-lg border border-gray-700">
                  {/* Panel Header */}
                  <div className="p-4 border-b border-gray-700 bg-[#1a1a2e]">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-white">Select Clients</h2>
                        <p className="text-gray-400 text-sm">
                          {selectedClients.length} of {filteredClients.length} clients selected
                        </p>
                      </div>
                      
                      {/* Search Bar */}
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search clients..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-[#1a1a2e] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Select All */}
                  <div className="px-4 py-3 bg-[#1a1a2e] border-b border-gray-700">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                      {selectAll ? (
                        <FaCheckSquare className="w-4 h-4" />
                      ) : (
                        <FaSquare className="w-4 h-4" />
                      )}
                      {selectAll ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  {/* Clients List */}
                  <div className="max-h-[300px] overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-400">Loading clients...</p>
                      </div>
                    ) : filteredClients.length === 0 ? (
                      <div className="text-center py-8">
                        <FaUser className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <h3 className="text-md font-medium text-gray-200 mb-1">No clients found</h3>
                        <p className="text-gray-500 text-sm">
                          {searchTerm ? 'No clients match your search' : 'No clients available'}
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-700">
                        {filteredClients.map((client) => {
                          const clientId = client._id || client.userId || client.id;
                          return (
                            <li 
                              key={clientId} 
                              className="px-4 py-3 hover:bg-[#1a1a2e] transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => toggleClientSelection(clientId)}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    {selectedClients.includes(clientId) ? (
                                      <FaCheckSquare className="w-5 h-5" />
                                    ) : (
                                      <FaSquare className="w-5 h-5" />
                                    )}
                                  </button>
                                  
                                  <div className="flex-shrink-0">
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-8 h-8 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-xs">
                                        {getClientName(client).charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="font-medium text-white text-sm">{getClientName(client)}</p>
                                    <p className="text-xs text-gray-400">{getClientEmail(client)}</p>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-gray-500">
                                  {client.profession || 'No profession'}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailModal;