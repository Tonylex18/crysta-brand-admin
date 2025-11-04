import { Edit2, Eye, Filter, Search } from "lucide-react";
import type { Order } from "../lib/api";

export const OrdersPage() {
    const [orders] = useState<Order[]>([
      { id: '1', orderNo: '#00745', date: '2024-11-01', customer: 'Guinever Cassi', items: 2, paid: true, status: 'pending', total: 2742.00 },
      { id: '2', orderNo: '#00321', date: '2024-10-25', customer: 'Hans Jensen', items: 11, paid: false, status: 'complete', total: 204.00 },
      { id: '3', orderNo: '#00114', date: '2024-10-22', customer: 'Vivo Lock', items: 3, paid: false, status: 'complete', total: 5039.00 },
      { id: '4', orderNo: '#00422', date: '2024-09-17', customer: 'Thorffin Odd', items: 4, paid: false, status: 'cancelled', total: 79.00 },
      { id: '5', orderNo: '#00332', date: '2024-08-12', customer: 'Thor Odinson', items: 9, paid: true, status: 'hold', total: 826.00 },
      { id: '6', orderNo: '#00256', date: '2024-08-05', customer: 'Jane Cooper', items: 5, paid: true, status: 'complete', total: 1450.00 },
    ]);
  
    return (
      <div className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">856</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-blue-600">24</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">782</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">50</p>
          </div>
        </div>
  
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
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
                  <th className="py-3 px-4 font-medium">Order No.</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Items</th>
                  <th className="py-3 px-4 font-medium">Paid</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Total</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{order.orderNo}</td>
                    <td className="py-4 px-4 text-gray-600">{order.date}</td>
                    <td className="py-4 px-4 text-gray-900">{order.customer}</td>
                    <td className="py-4 px-4 text-gray-600">{order.items} items</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {order.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        order.status === 'complete' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900 font-medium">${order.total.toLocaleString()}</td>
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