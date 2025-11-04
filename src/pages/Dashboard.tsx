import { MoreVertical } from "lucide-react";

export const DashboardPage() {
    const StatCard = ({ title, value, change, changeType, comparison }: any) => (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="text-right">
            <p className={`text-sm font-semibold ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'up' ? '↑' : '↓'} {change}
            </p>
            <p className="text-xs text-gray-400 mt-1">{comparison}</p>
          </div>
        </div>
      </div>
    );
  
    const orders: Order[] = [
      { id: '1', orderNo: '#00745', date: '2024-11-01', customer: 'Guinever Cassi', items: 2, paid: true, status: 'pending', total: 2742.00 },
      { id: '2', orderNo: '#00321', date: '2024-10-25', customer: 'Hans Jensen', items: 11, paid: false, status: 'complete', total: 204.00 },
      { id: '3', orderNo: '#00114', date: '2024-10-22', customer: 'Vivo Lock', items: 3, paid: false, status: 'complete', total: 5039.00 },
      { id: '4', orderNo: '#00422', date: '2024-09-17', customer: 'Thorffin Odd', items: 4, paid: false, status: 'cancelled', total: 79.00 },
      { id: '5', orderNo: '#00332', date: '2024-08-12', customer: 'Thor Odinson', items: 9, paid: true, status: 'hold', total: 826.00 }
    ];
  
    return (
      <div className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatCard
            title="Sales total"
            value="$2,456"
            change="26%"
            changeType="up"
            comparison="Compared to last month"
          />
          <StatCard
            title="Average order value"
            value="$372.98"
            change="16%"
            changeType="down"
            comparison="Compared to last month"
          />
          <StatCard
            title="Total orders"
            value="678"
            change="46%"
            changeType="up"
            comparison="Compared to last month"
          />
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent orders</h3>
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-gray-500 text-left">
                  <th className="py-3 font-medium">Order No.</th>
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium">Customer</th>
                  <th className="py-3 font-medium">Items</th>
                  <th className="py-3 font-medium">Paid</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-4 text-gray-700">{order.orderNo}</td>
                    <td className="py-4 text-gray-700">{order.date}</td>
                    <td className="py-4 text-gray-700">{order.customer}</td>
                    <td className="py-4 text-gray-700">{order.items} items</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        order.paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {order.paid ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded text-xs font-medium capitalize ${
                        order.status === 'complete' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-gray-700">${order.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }