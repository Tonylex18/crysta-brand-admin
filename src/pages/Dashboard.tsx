import { MoreVertical } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { ordersAPI } from "../lib/api";

type Order = {
  id: string;
  orderNo: string;
  date: string;
  customer: string;
  items: number;
  paid: boolean;
  status: 'pending' | 'complete' | 'cancelled' | 'hold';
  total: number;
};

export function DashboardPage(): JSX.Element {
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

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await ordersAPI.getAllOrders();
        const list = Array.isArray(res) ? res : res?.data || [];
        const normalized: Order[] = list.map((o: any) => ({
          id: o.id || o._id,
          orderNo: o.orderNo || o.orderNumber || `#${(o._id || '').slice(-6)}`,
          date: o.created_at || o.createdAt || '',
          customer: o.user_id?.name || o.customer?.name || o.user?.name || 'Customer',
          items: o.items?.length || o.products?.length || 0,
          paid: o.status === 'paid' || o.paymentStatus === 'paid',
          status: (o.status || 'pending') as any,
          total: o.total || o.totalAmount || 0,
        }));
        setOrders(normalized);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const salesTotal = orders.reduce((sum, o) => sum + (o.paid ? o.total : 0), 0);
    const avgOrder = totalOrders ? salesTotal / totalOrders : 0;
    return { totalOrders, salesTotal, avgOrder };
  }, [orders]);

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Sales total"
          value={`$${stats.salesTotal.toFixed(2)}`}
          change=""
          changeType="up"
          comparison=""
        />
        <StatCard
          title="Average order value"
          value={`$${stats.avgOrder.toFixed(2)}`}
          change=""
          changeType="up"
          comparison=""
        />
        <StatCard
          title="Total orders"
          value={`${stats.totalOrders}`}
          change=""
          changeType="up"
          comparison=""
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
              {error && (
                <tr><td className="py-4 text-red-600" colSpan={7}>{error}</td></tr>
              )}
              {loading && (
                <tr><td className="py-4 text-gray-500" colSpan={7}>Loading...</td></tr>
              )}
              {!loading && !error && orders.map((order) => (
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