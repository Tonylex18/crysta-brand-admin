import { useState } from "react";
import type { Product } from "../lib/api";
import { Edit2, Eye, Filter, Plus, Search, Trash2 } from "lucide-react";

export const ProductsPage() {
    const [products] = useState<Product[]>([
      { id: '1', name: 'Premium Wireless Headphones', category: 'Electronics', price: 299.99, stock: 45, status: 'active', image: '/api/placeholder/80/80' },
      { id: '2', name: 'Organic Cotton T-Shirt', category: 'Clothing', price: 29.99, stock: 120, status: 'active', image: '/api/placeholder/80/80' },
      { id: '3', name: 'Smart Watch Pro', category: 'Electronics', price: 399.99, stock: 0, status: 'inactive', image: '/api/placeholder/80/80' },
      { id: '4', name: 'Leather Messenger Bag', category: 'Accessories', price: 149.99, stock: 30, status: 'active', image: '/api/placeholder/80/80' },
      { id: '5', name: 'Yoga Mat Premium', category: 'Sports', price: 49.99, stock: 85, status: 'active', image: '/api/placeholder/80/80' },
    ]);
  
    return (
      <div className="p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
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
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{product.category}</td>
                    <td className="py-4 px-4 text-gray-900 font-medium">${product.price}</td>
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
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
      </div>
    );
  }