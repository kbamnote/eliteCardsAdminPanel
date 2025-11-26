import React, { useState, useEffect } from "react";
import { allClients, sendGroupMail } from "../../../utils/Api";
import { Mail as MailIcon, Send, User, CheckSquare, Square, Search, Paperclip, X } from "lucide-react";

const MailPage = () => {
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
    } catch (error) {
      console.error("Error fetching clients:", error);
      setErrorMessage("Failed to load clients. Please try again.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

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

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types (PDF and images only)
    const validFiles = files.filter(file => {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValid) {
        setErrorMessage(`File "${file.name}" is not a valid PDF or image file`);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
      return isValid;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
    e.target.value = ''; // Reset input
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle client selection
  const toggleClientSelection = (client) => {
    const clientId = client.userId?._id || client._id;
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
      setSelectedClients(filteredClients.map(client => client.userId?._id || client._id));
    }
    setSelectAll(!selectAll);
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
      // Create FormData object
      const formData = new FormData();
      
      // Append clientIds as array
      selectedClients.forEach(id => {
        formData.append('clientIds[]', id);
      });
      
      // Append subject and message
      formData.append('subject', mailData.subject);
      formData.append('message', mailData.message);
      
      // Append attachments
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      await sendGroupMail(formData);
      
      // Reset form
      setMailData({
        subject: "",
        message: ""
      });
      setSelectedClients([]);
      setSelectAll(false);
      setAttachments([]);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error sending mail:", error);
      setErrorMessage(error.response?.data?.message || "Failed to send mail. Please try again.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <MailIcon className="h-6 w-6 text-green-500 mr-2" />
          <h2 className="text-2xl font-bold text-white">Email Campaign</h2>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {showSuccess && (
        <div className="mb-4 bg-green-500 text-white p-3 rounded-md text-sm">
          Email sent successfully to {selectedClients.length} client(s)!
        </div>
      )}
      
      {showError && (
        <div className="mb-4 bg-red-500 text-white p-3 rounded-md text-sm">
          {errorMessage}
          <button 
            onClick={() => {
              setShowError(false);
              fetchClients(); // Try to fetch clients again
            }}
            className="ml-4 text-white hover:text-gray-200 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mail Composition Panel */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f0f1a] rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Send className="text-green-500" />
              Compose Email
            </h2>
            
            <form onSubmit={handleSendMail}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={mailData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter email subject"
                    className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={mailData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your message here..."
                    rows="6"
                    className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    required
                  />
                </div>
                
                {/* Attachments Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Attachments (PDF & Images)
                  </label>
                  
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-green-500 hover:bg-[#1a1a2e] transition-all">
                    <Paperclip className="text-gray-400" />
                    <span className="text-sm text-gray-300">Choose files</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  
                  {/* Attachment List */}
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((file, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between bg-[#1a1a2e] px-3 py-2 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Paperclip className="text-gray-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-gray-300 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-400 hover:text-red-300 flex-shrink-0 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={sending || selectedClients.length === 0}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    sending || selectedClients.length === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
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
          <div className="bg-[#0f0f1a] rounded-xl shadow-lg overflow-hidden border border-gray-700">
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-700 bg-[#1a1a2e]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Select Clients</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedClients.length} of {filteredClients.length} clients selected
                  </p>
                </div>
                
                {/* Select All */}
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm font-medium text-green-500 hover:text-green-400"
                >
                  {selectAll ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {selectAll ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            
            {/* Clients List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Profession</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <tr key={client._id} className="hover:bg-[#1a1a2e]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {getClientName(client).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{getClientName(client)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{client.profession || 'Not specified'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{getClientEmail(client)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => toggleClientSelection(client)}
                            className="text-green-500 hover:text-green-400"
                          >
                            {selectedClients.includes(client.userId?._id || client._id) ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                        {searchTerm ? 'No clients match your search' : 'No clients available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {filteredClients.length === 0 && (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <button 
                  onClick={fetchClients}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Refresh Clients
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailPage;