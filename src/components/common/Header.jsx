import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Function to get page title based on current route
  const getPageTitle = () => {
    // Split the path and get the main section
    const pathParts = location.pathname.split('/').filter(part => part !== '');
    
    // Handle specific routes
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/all-clients':
        return 'All Clients';
      case '/register':
        return 'Register New Client';
      default:
        // Handle other potential routes with a more generic approach
        if (pathParts.length > 0) {
          // Convert kebab-case to Title Case
          return pathParts.map(part => {
            // Handle ID parameters by showing the section name
            if (part.length === 24 && /^[0-9a-fA-F]+$/.test(part)) {
              // This looks like an ID, skip it
              return null;
            }
            // Convert kebab-case to Title Case
            return part.split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }).filter(Boolean).join(' > ') || 'Admin Panel';
        }
        
        return 'Admin Panel';
    }
  };

  // Function to get current date in a readable format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to determine if we should show back button
  const shouldShowBackButton = () => {
    // Show back button for detail pages and nested routes
    return false; // For now, we don't have detail pages
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 bg-[#0f0f1a] shadow z-10"> {/* Make header fixed */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <button
            className="md:hidden mr-4 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
          {shouldShowBackButton() && (
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-white">{getPageTitle()}</h1>
        </div>
        <div className="text-sm font-medium text-gray-300">
          {getCurrentDate()}
        </div>
      </div>
    </header>
  );
};

export default Header;