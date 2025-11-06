import { useEffect, useState } from "react";
import { Edit2, Filter, Plus, Search, Trash2, Power, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productsAPI, resolveImageUrl } from "../lib/api";
import { toast } from "react-toastify";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image: string;
};

export function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ProductRow | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productsAPI.getAll();
      const list = Array.isArray(res) ? res : res?.data || [];
      const normalized: ProductRow[] = list.map((p: any) => ({
        id: p.id || p._id,
        name: p.name,
        category: p.category_id?.name || "-",
        price: p.price,
        stock: p.stock ?? 0,
        status: p.isActive ? 'active' : 'inactive',
        image: resolveImageUrl(p.image_url),
      }));
      setProducts(normalized);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load products");
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button onClick={() => navigate("../products/add")} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
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
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr>
                  <td className="py-6 px-4 text-red-600" colSpan={6}>{error}</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className="py-6 px-4 text-gray-500" colSpan={6}>Loading...</td>
                </tr>
              )}
              {!loading && !error && products.length === 0 && (
                <tr>
                  <td className="py-10 px-4 text-center text-gray-500" colSpan={6}>
                    No products yet. Click "Add Product" to create your first product.
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{product.category}</td>
                  <td className="py-4 px-4 text-gray-900 font-medium">₦{product.price}</td>
                  <td className="py-4 px-4">
                    <span className={`${product.stock === 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => navigate(`../products/${product.id}/edit`)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button onClick={async () => { await handleToggle(product, setProducts); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title={product.status === 'active' ? 'Deactivate' : 'Activate'}>
                        <Power className={`w-4 h-4 ${product.status === 'active' ? 'text-yellow-600' : 'text-green-600'}`} />
                      </button>
                      <button onClick={() => { setPendingDelete(product); setConfirmOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmOpen && pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmOpen(false)} />
          <div className="relative bg-white rounded-xl w-[95%] sm:w-[480px] max-w-[96vw] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete product</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete "{pendingDelete.name}"? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    await productsAPI.deleteProduct(pendingDelete.id);
                    setProducts((prev) => prev.filter(p => p.id !== pendingDelete.id));
                    toast.success(`Product "${pendingDelete.name}" deleted`);
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || e?.message || 'Failed to delete product');
                  } finally {
                    setConfirmOpen(false);
                    setPendingDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function handleToggle(product: ProductRow, setProducts: React.Dispatch<React.SetStateAction<ProductRow[]>>) {
  try {
    if (product.status === 'active') {
      await productsAPI.deactivateProduct(product.id);
      setProducts((prev) => prev.map(p => p.id === product.id ? { ...p, status: 'inactive' } : p));
      toast.info(`Product "${product.name}" deactivated`);
    } else {
      await productsAPI.activateProduct(product.id);
      setProducts((prev) => prev.map(p => p.id === product.id ? { ...p, status: 'active' } : p));
      toast.success(`Product "${product.name}" activated`);
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message || e?.message || "Failed to update product status");
  }
}
