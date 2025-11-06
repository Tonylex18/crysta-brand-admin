import { Edit2, Eye, Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ordersAPI } from "../lib/api";
import { toast } from "react-toastify";

type Order = {
  id: string;
  orderNo: string;
  date: string;
  customer: string;
  items: number;
  paid: boolean;
  status: string;
  total: number;
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        status: o.status || 'pending',
        total: o.total || o.totalAmount || 0,
      }));
      setOrders(normalized);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load orders';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const completed = orders.filter(o => ['complete', 'completed', 'delivered'].includes(o.status)).length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    return { totalOrders, pending, completed, cancelled };
  }, [orders]);

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Pending</p>
          <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
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
              {error && (
                <tr><td className="py-4 px-4 text-red-600" colSpan={8}>{error}</td></tr>
              )}
              {loading && (
                <tr><td className="py-4 px-4 text-gray-500" colSpan={8}>Loading...</td></tr>
              )}
              {!loading && !error && orders.map((order) => (
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
                    <select
                      value={order.status}
                      onChange={async (e) => {
                        const next = e.target.value;
                        try {
                          await ordersAPI.updateOrderStatus(order.id, next);
                          setOrders((prev) => prev.map(o => o.id === order.id ? { ...o, status: next } : o));
                          toast.success(`Order ${order.orderNo} updated to ${next}`);
                        } catch (err: any) {
                          toast.error(err?.response?.data?.message || err?.message || 'Failed to update order');
                        }
                      }}
                      className="px-2 py-1 border border-gray-200 rounded"
                    >
                      {['pending','processing','shipped','delivered','cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
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