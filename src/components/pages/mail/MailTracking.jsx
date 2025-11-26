import React, { useState, useEffect } from "react";
import { getMailTrackingData } from "../../../utils/Api";
import { Mail, Search, RotateCcw, CheckCircle, Clock, XCircle, Paperclip, Eye, X } from "lucide-react";

const MailTracking = () => {
  const [mails, setMails] = useState([]);
  const [filteredMails, setFilteredMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [selectedMail, setSelectedMail] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch mail tracking data
  const fetchMailTrackingData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMailTrackingData();
      // Extract mails from the response (response.data.mails)
      const data = response.data?.mails || [];
      setMails(data);
      setFilteredMails(data);
    } catch (err) {
      console.error("Error fetching mail tracking data:", err);
      setError("Failed to load mail tracking data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMailTrackingData();
  }, []);

  // Filter mails based on search term and status
  useEffect(() => {
    let result = mails;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(mail => 
        (mail.subject && mail.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mail.recipients && mail.recipients.some(recipient => recipient.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (mail.clientIds && mail.clientIds.some(client => {
          // Since we only populate email, we can only search by email
          return client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase());
        }))
      );
    }
    
    // Apply status filter (in this case, we'll consider all mails as "sent" since that's the only status we have)
    if (statusFilter !== "all") {
      // For now, we don't have different statuses in the API response, so we'll just filter by "sent"
      // In a real implementation, this would filter based on actual status fields
    }
    
    setFilteredMails(result);
  }, [searchTerm, statusFilter, mails]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRecipientCount = (mail) => {
    return mail.recipients ? mail.recipients.length : 0;
  };

  const getClientCount = (mail) => {
    return mail.clientIds ? mail.clientIds.length : 0;
  };

  const hasAttachments = (mail) => {
    return mail.attachments && mail.attachments.length > 0;
  };

  const handleViewDetails = (mail) => {
    setSelectedMail(mail);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMail(null);
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
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-white w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Data</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchMailTrackingData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] mt-20 rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Mail className="h-6 w-6 text-green-500 mr-2" />
          <h2 className="text-2xl font-bold text-white">Mail Tracking</h2>
        </div>
        
        <div className="flex gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all" className="bg-[#0f0f1a]">All Statuses</option>
            <option value="sent" className="bg-[#0f0f1a]">Sent</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="flex items-center gap-2 px-3 py-2 bg-[#0f0f1a] text-gray-300 rounded-lg hover:bg-[#1a1a2e] transition-colors border border-gray-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search mails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0f0f1a] rounded-xl shadow p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg mr-3">
              <Mail className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Sent</p>
              <p className="text-xl font-bold text-white">{mails.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0f0f1a] rounded-xl shadow p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg mr-3">
              <Mail className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Recipients</p>
              <p className="text-xl font-bold text-white">
                {mails.reduce((total, mail) => total + getRecipientCount(mail), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#0f0f1a] rounded-xl shadow p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg mr-3">
              <Mail className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Clients</p>
              <p className="text-xl font-bold text-white">
                {mails.reduce((total, mail) => total + getClientCount(mail), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#0f0f1a] rounded-xl shadow p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500 rounded-lg mr-3">
              <Paperclip className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">With Attachments</p>
              <p className="text-xl font-bold text-white">
                {mails.filter(mail => hasAttachments(mail)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mail Tracking Table */}
      <div className="bg-[#0f0f1a] rounded-xl shadow-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Clients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sent Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Attachments</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredMails.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    No emails found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredMails.map((mail) => (
                  <tr key={mail._id} className="hover:bg-[#1a1a2e]">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{mail.subject || 'No Subject'}</div>
                      <div className="text-xs text-gray-400">From: {mail.senderEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {getRecipientCount(mail)} recipient{getRecipientCount(mail) !== 1 ? 's' : ''}
                      </div>
                      {mail.recipients && mail.recipients.length > 0 && (
                        <div className="text-xs text-gray-500 truncate">
                          {mail.recipients[0]}
                          {mail.recipients.length > 1 && ` +${mail.recipients.length - 1} more`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {getClientCount(mail)} client{getClientCount(mail) !== 1 ? 's' : ''}
                      </div>
                      {mail.clientIds && mail.clientIds.length > 0 && (
                        <div className="text-xs text-gray-500 truncate">
                          {mail.clientIds[0].email || 'Unknown Client'}
                          {mail.clientIds.length > 1 && ` +${mail.clientIds.length - 1} more`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(mail.sentAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasAttachments(mail) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                          <Paperclip className="mr-1" />
                          {mail.attachments.length}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleViewDetails(mail)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mail Details Modal */}
      {showModal && selectedMail && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f1a] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 bg-[#1a1a2e]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-bold text-white">Mail Details</h3>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                      <p className="text-white font-medium">{selectedMail.subject || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Sender Email</label>
                      <p className="text-green-400">{selectedMail.senderEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Sender Role</label>
                      <p className="text-white">{selectedMail.senderRole || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Recipient Type</label>
                      <p className="text-white">{selectedMail.recipientType || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Message ID</label>
                      <p className="text-white font-mono text-sm">{selectedMail.messageId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Sent Date</label>
                      <p className="text-white">{formatDate(selectedMail.sentAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Recipients */}
                <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Recipients Email ({getRecipientCount(selectedMail)})</h4>
                  <div className="space-y-2">
                    {selectedMail.recipients && selectedMail.recipients.length > 0 ? (
                      selectedMail.recipients.map((recipient, index) => (
                        <div key={index} className="flex items-center p-3 bg-[#0f0f1a] rounded-lg border border-gray-700">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{index + 1}</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-white">{recipient}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No recipients found</p>
                    )}
                  </div>
                </div>

                {/* Clients */}
                <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Clients ({getClientCount(selectedMail)})</h4>
                  <div className="space-y-2">
                    {selectedMail.clientIds && selectedMail.clientIds.length > 0 ? (
                      selectedMail.clientIds.map((client, index) => (
                        <div key={client._id} className="flex items-center p-3 bg-[#0f0f1a] rounded-lg border border-gray-700">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {client.email ? client.email.charAt(0).toUpperCase() : '#'}
                            </span>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-white font-medium">{client.email || 'N/A'}</p>
                            <p className="text-gray-400 text-sm">{client.email || 'N/A'}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {client._id}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No clients found</p>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Attachments ({hasAttachments(selectedMail) ? selectedMail.attachments.length : 0})</h4>
                  <div className="space-y-2">
                    {hasAttachments(selectedMail) ? (
                      selectedMail.attachments.map((attachment, index) => (
                        <div key={attachment._id} className="flex items-center p-3 bg-[#0f0f1a] rounded-lg border border-gray-700">
                          <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <Paperclip className="text-white w-5 h-5" />
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-white font-medium">{attachment.filename || 'N/A'}</p>
                            <p className="text-gray-400 text-sm">
                              {attachment.size ? `${(attachment.size / 1024).toFixed(2)} KB` : 'Size unknown'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {attachment._id}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No attachments found</p>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-[#1a1a2e] rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Timestamps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Sent At</label>
                      <p className="text-white">{formatDate(selectedMail.sentAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Created At</label>
                      <p className="text-white">{formatDate(selectedMail.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Updated At</label>
                      <p className="text-white">{formatDate(selectedMail.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-700 bg-[#1a1a2e] flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailTracking;