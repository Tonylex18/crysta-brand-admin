import { type JSX } from 'react';
import {
  ShoppingCart, BarChart3, Users, Package, Tag, MessageSquare,
  Settings, LogOut, Search, Bell, MoreVertical
} from 'lucide-react';

// Types
type StatCardProps = {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  comparison: string;
};

type MenuItemProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  badge?: string;
};

type OrdersTableProps = {
  orders: {
    no: string;
    date: string;
    customer: string;
    items: string;
    paid: boolean;
    status: string;
    total: number;
  }[];
};

// Stat Card Component
const StatCard = ({
  title, value, change, changeType, comparison
}: StatCardProps): JSX.Element => (
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

// Sidebar Menu Item Component
const MenuItem = ({
  icon: Icon, label, active, badge
}: MenuItemProps): JSX.Element => (
  <div className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${
    active ? 'bg-green-300 text-gray-900' : 'text-gray-500 hover:bg-gray-100'
  }`}>
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
    {badge && (
      <span className="bg-teal-700 text-white text-xs font-bold px-2 py-1 rounded">
        {badge}
      </span>
    )}
  </div>
);

// Orders Table Component
const OrdersTable = ({ orders }: OrdersTableProps): JSX.Element => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent orders</h3>
      <MoreVertical className="w-5 h-5 text-gray-400" />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-gray-500 text-left">
            <th className="py-3 font-medium">No.</th>
            <th className="py-3 font-medium">Date</th>
            <th className="py-3 font-medium">Date</th>
            <th className="py-3 font-medium">Customer</th>
            <th className="py-3 font-medium">Items</th>
            <th className="py-3 font-medium">Paid</th>
            <th className="py-3 font-medium">Status</th>
            <th className="py-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => (
            <tr key={idx} className="border-b last:border-0">
              <td className="py-4 text-gray-700">{order.no}</td>
              <td className="py-4 text-gray-700">{order.date}</td>
              <td className="py-4 text-gray-700">{order.date}</td>
              <td className="py-4 text-gray-700">{order.customer}</td>
              <td className="py-4 text-gray-700">{order.items}</td>
              <td className="py-4">
                <span className={`px-3 py-1 rounded text-xs font-medium ${
                  order.paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {order.paid ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="py-4">
                <span className={`px-3 py-1 rounded text-xs font-medium ${
                  order.status === 'Complete' ? 'bg-green-100 text-green-700' :
                  order.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'Cancel' ? 'bg-orange-100 text-orange-700' :
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
);

export default function Dashboard(): JSX.Element {

  const ordersData: OrdersTableProps['orders'] = [
    { no: '#00745', date: '2022-12-23', customer: 'Guinever Cassi', items: '2 items', paid: true, status: 'Pending', total: 2742.00 },
    { no: '#00321', date: '2022-11-25', customer: 'Hans Jensen', items: '11 items', paid: false, status: 'Complete', total: 204.00 },
    { no: '#00114', date: '2022-10-22', customer: 'Vivo Lock', items: '3 items', paid: false, status: 'Complete', total: 5039.00 },
    { no: '#00422', date: '2022-09-17', customer: 'Thorffin Odd', items: '4 items', paid: false, status: 'Cancel', total: 79.00 },
    { no: '#00332', date: '2022-08-12', customer: 'Thor Odinson', items: '9 items', paid: true, status: 'Hold', total: 826.00 }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-gray-700" />
            <span className="text-xl font-bold text-gray-900">Crysta</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-3 px-2">MENU</p>
            <div className="space-y-1">
              <MenuItem icon={BarChart3} label="Dashboard" active />
              <MenuItem icon={Package} label="Products" />
              <MenuItem icon={Users} label="Customer" />
              <MenuItem icon={ShoppingCart} label="Orders" />
              <MenuItem icon={Tag} label="Coupons" />
              <MenuItem icon={MessageSquare} label="Chats" badge="4" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-3 px-2">OTHER</p>
            <div className="space-y-1">
              <MenuItem icon={Settings} label="Integrations" />
              <MenuItem icon={Settings} label="Settings" />
              <MenuItem icon={LogOut} label="Logout" />
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search something here"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/api/placeholder/40/40" alt="User" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">Sifat Hasan</p>
                  <p className="text-xs text-gray-500">sifatux@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Dashboard Content */}
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <StatCard
              title="Sales total"
              value="$2456"
              change="26%"
              changeType="up"
              comparison="Compared to December 2023"
            />
            <StatCard
              title="Average order value"
              value="$372.98"
              change="16%"
              changeType="down"
              comparison="Compared to December 2023"
            />
            <StatCard
              title="Total orders"
              value="678"
              change="46%"
              changeType="up"
              comparison="Compared to December 2023"
            />
          </div>
          <OrdersTable orders={ordersData} />
        </div>
      </div>
    </div>
  );
}