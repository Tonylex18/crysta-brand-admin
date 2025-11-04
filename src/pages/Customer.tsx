import { Edit2, Eye, Filter, Plus, Search } from "lucide-react";
import { useState } from "react";

export const CustomersPage() {
    const [customers] = useState<Customer[]>([
      { id: '1', name: 'Sarah Johnson', email: 'sarah.j@example.com', orders: 12, totalSpent: 3420.50, joinDate: '2024-01-15', status: 'active' },
      { id: '2', name: 'Michael Chen', email: 'mchen@example.com', orders: 8, totalSpent: 1250.00, joinDate: '2024-02-20', status: 'active' },
      { id: '3', name: 'Emma Williams', email: 'emma.w@example.com', orders: 25, totalSpent: 8950.75, joinDate: '2023-11-10', status: 'active' },
      { id: '4', name: 'James Brown', email: 'jbrown@example.com', orders: 3, totalSpent: 450.00, joinDate: '2024-09-05', status: 'inactive' },
      { id: '5', name: 'Lisa Anderson', email: 'l.anderson@example.com', orders: 18, totalSpent: 5230.25, joinDate: '2024-03-12', status: 'active' },
    ]);
  
    return (
      <div className="p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Customer</span>
          </button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">1,234</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Active Customers</p>
            <p className="text-2xl font-bold text-green-600">987</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">New This Month</p>
            <p className="text-2xl font-bold text-blue-600">145</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Avg. Order Value</p>
            <p className="text-2xl font-bold text-gray-900">$342</p>
          </div>
        </div>
  
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>
  
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-gray-500 text-left text-sm">
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Orders</th>
                  <th className="py-3 px-4 font-medium">Total Spent</th>
                  <th className="py-3 px-4 font-medium">Join Date</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{customer.orders}</td>
                    <td className="py-4 px-4 text-gray-900 font-medium">${customer.totalSpent.toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-600">{customer.joinDate}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  