import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export const SettingsPage() {
    const { admin } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
  
    return (
      <div className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
  
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'security' ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'notifications' ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('store')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'store' ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Store Settings
                </button>
              </div>
            </div>
          </div>
  
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                        {admin?.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                        Change Photo
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          defaultValue={admin?.name || ''}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue={admin?.email || ''}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <input
                          type="text"
                          value="Administrator"
                          disabled
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'New Orders', desc: 'Receive notifications for new orders' },
                      { label: 'Low Stock Alerts', desc: 'Get alerted when products are low in stock' },
                      { label: 'Customer Messages', desc: 'Notifications for new customer messages' },
                      { label: 'Weekly Reports', desc: 'Receive weekly sales reports via email' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-4 border-b last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              {activeTab === 'store' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Store Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                      <input
                        type="text"
                        defaultValue="Crysta Store"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                        defaultValue="Premium e-commerce store offering quality products"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300">
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>GBP (£)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300">
                          <option>GMT (UTC+0)</option>
                          <option>EST (UTC-5)</option>
                          <option>PST (UTC-8)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }