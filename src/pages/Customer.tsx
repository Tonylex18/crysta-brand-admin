import { Edit2, Eye, Filter, Plus, Search, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { customerAPI, ordersAPI } from "../lib/api";
import { toast } from "react-toastify";

type Customer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  joinDate: string;
  status: 'active' | 'inactive';
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, ordersRes] = await Promise.all([
        customerAPI.getAllCustomer(),
        ordersAPI.getAllOrders().catch(() => ({ data: [] }))
      ]);
      const users = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];
      const orders = Array.isArray(ordersRes) ? ordersRes : ordersRes?.data || [];

      // Group orders by user_id to calculate stats per customer
      const ordersByUser: Record<string, any[]> = {};
      orders.forEach((o: any) => {
        const uid = o.user_id?._id || o.user_id || o.user?._id || o.user;
        if (uid) {
          if (!ordersByUser[uid]) ordersByUser[uid] = [];
          ordersByUser[uid].push(o);
        }
      });

      const normalized: Customer[] = users.map((u: any) => {
        const userOrders = ordersByUser[u._id || u.id] || [];
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
        const joinDate = u.createdAt || u.created_at || '';
        return {
          id: u._id || u.id,
          name: u.name || 'Unknown',
          email: u.email || '',
          orders: userOrders.length,
          totalSpent,
          joinDate: joinDate ? new Date(joinDate).toISOString().split('T')[0] : '',
          status: u.isEmailVerified ? 'active' : 'inactive',
        };
      });
      setCustomers(normalized);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load customers';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = customers.filter(c => {
      if (!c.joinDate) return false;
      return new Date(c.joinDate) >= thisMonth;
    }).length;
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    return { totalCustomers, activeCustomers, newThisMonth, avgOrderValue };
  }, [customers]);

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Active Customers</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeCustomers}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">New This Month</p>
          <p className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Avg. Order Value</p>
          <p className="text-2xl font-bold text-gray-900">₦{stats.avgOrderValue.toFixed(2)}</p>
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
              {error && (
                <tr>
                  <td className="py-4 px-4 text-red-600" colSpan={6}>{error}</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className="py-4 px-4 text-gray-500" colSpan={6}>Loading...</td>
                </tr>
              )}
              {!loading && !error && customers.length === 0 && (
                <tr>
                  <td className="py-10 px-4 text-center text-gray-500" colSpan={6}>No customers found</td>
                </tr>
              )}
              {!loading && !error && customers.map((customer) => (
                <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.name[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{customer.orders}</td>
                  <td className="py-4 px-4 text-gray-900 font-medium">₦{customer.totalSpent.toFixed(2)}</td>
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
  