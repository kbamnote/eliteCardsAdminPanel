import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Package, MessageCircle, Mail, BarChart2, CheckCircle, Clock, UserPlus } from 'lucide-react';
import { getDashboardStats, getMailTrackingData, getAllServices, getAllProducts, getAllTestimonials } from '../../../utils/Api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    clientsWithProfiles: 0,
    totalServices: 0,
    totalProducts: 0,
    totalTestimonials: 0,
    profileCompletionRate: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics
        const statsResponse = await getDashboardStats();
        
        if (statsResponse.data.success) {
          const data = statsResponse.data.data;
          const profileCompletionRate = data.totalClients > 0 
            ? Math.round((data.clientsWithProfiles / data.totalClients) * 100) 
            : 0;
          
          setStats({
            totalClients: data.totalClients,
            clientsWithProfiles: data.clientsWithProfiles,
            totalServices: data.totalServices,
            totalProducts: data.totalProducts,
            totalTestimonials: data.totalTestimonials,
            profileCompletionRate
          });
          
          // Combine recent clients and profiles for activity feed
          const activityFeed = [
            ...data.recentClients.map(client => ({
              type: 'client',
              title: 'New client registered',
              description: client.email,
              timestamp: client.createdAt,
              icon: UserPlus
            })),
            ...data.recentProfiles.map(profile => ({
              type: 'profile',
              title: 'Profile completed',
              description: profile.userId?.email || profile.email || 'Unknown user',
              timestamp: profile.createdAt,
              icon: CheckCircle
            }))
          ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);
          
          setRecentActivity(activityFeed);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data: ' + err.message);
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const statCards = [
    { 
      name: 'Total Clients', 
      value: stats.totalClients, 
      icon: Users,
      color: 'bg-blue-500'
    },
    { 
      name: 'Profile Completion', 
      value: `${stats.profileCompletionRate}%`, 
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    { 
      name: 'Total Services', 
      value: stats.totalServices, 
      icon: Briefcase,
      color: 'bg-purple-500'
    },
    { 
      name: 'Total Products', 
      value: stats.totalProducts, 
      icon: Package,
      color: 'bg-yellow-500'
    },
    { 
      name: 'Total Testimonials', 
      value: stats.totalTestimonials, 
      icon: MessageCircle,
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="space-y-6">
      <style jsx>{`
        .clip-path-half {
          clip-path: inset(0 0 0 50%);
        }
      `}</style>
      
      {/* Welcome Header */}
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome to Elite Digital Cards Admin Panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[#1a1a2e] overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-white">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion Chart */}
        <div className="lg:col-span-1 bg-[#1a1a2e] rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">Profile Completion</h2>
          <div className="flex items-center justify-center h-48">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.profileCompletionRate}%</div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
              </div>
              <div 
                className="absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-green-500"
                style={{
                  clipPath: `inset(0 ${100 - stats.profileCompletionRate}% 0 0)`
                }}
              ></div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              {stats.clientsWithProfiles} of {stats.totalClients} clients have completed profiles
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#1a1a2e] rounded-xl shadow-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-white">Recent Activity</h2>
            <p className="mt-1 text-sm text-gray-400">Latest actions in the system</p>
          </div>
          <div className="border-t border-gray-700">
            {recentActivity.length > 0 ? (
              <ul className="divide-y divide-gray-700">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <li key={index} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-gray-700 rounded-full p-2">
                          <Icon className="h-5 w-5 text-gray-300" />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">{activity.title}</p>
                            <div className="text-sm text-gray-400">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-gray-400">{activity.description}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-gray-400">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-medium text-white mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0f0f1a] p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-400">Data Summary</h3>
            </div>
            <p className="mt-2 text-white">System is running smoothly with all components active.</p>
          </div>
          <div className="bg-[#0f0f1a] p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-400">Last Updated</h3>
            </div>
            <p className="mt-2 text-white">{new Date().toLocaleString()}</p>
          </div>
          <div className="bg-[#0f0f1a] p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-purple-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-400">Active Users</h3>
            </div>
            <p className="mt-2 text-white">Admin panel is currently active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;