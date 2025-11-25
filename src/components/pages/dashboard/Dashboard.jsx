import React from 'react';
import { Users, CreditCard, Calendar, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  // Mock data for dashboard stats
  const stats = [
    { name: 'Total Clients', value: '142', change: '+12%', icon: Users },
    { name: 'Active Cards', value: '89', change: '+5%', icon: CreditCard },
    { name: 'Appointments', value: '24', change: '+18%', icon: Calendar },
    { name: 'This Month', value: '1242', change: '+23%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 mt-20">

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[#1a1a2e] overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-white">{stat.value}</div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-500">
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1a1a2e] shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-white">Recent Activity</h2>
          <p className="mt-1 text-sm text-gray-400">Latest actions in the system</p>
        </div>
        <div className="border-t border-gray-700">
          <ul className="divide-y divide-gray-700">
            {[1, 2, 3, 4, 5].map((item) => (
              <li key={item} className="px-4 py-4 sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-700 rounded-full p-2">
                    <Users className="h-5 w-5 text-gray-300" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">New client registered</p>
                      <div className="text-sm text-gray-400">2 hours ago</div>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-400">John Doe (john@example.com)</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;