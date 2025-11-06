import { useEffect, useMemo, useState } from "react";
import { Plus, Image as ImageIcon, X, Trash2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { categoriesAPI } from "../lib/api";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export default function Categories() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isValid = useMemo(() => name.trim().length > 0, [name]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await categoriesAPI.getAll();
      const rows = Array.isArray(res) ? res : res?.data || [];
      const normalized: CategoryRow[] = rows.map((r: any) => ({
        id: r.id || r._id,
        name: r.name,
        slug: r.slug,
        description: r.description ?? null,
        image_url: r.image_url ?? null,
        created_at: r.created_at || r.createdAt || "",
      }));
      setCategories(normalized);
    } catch (e: any) {
      const msg = e?.message || "Failed to load categories";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("name", name.trim());
      if (description.trim()) form.append("description", description.trim());
      if (imageFile) form.append("image_url", imageFile);

      await categoriesAPI.addCategory(form);
      setOpen(false);
      setName("");
      setDescription("");
      setImageFile(null);
      await load();
      toast.success("Category created successfully");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to create category";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      setLoading(true);
      await categoriesAPI.deleteCategory(id);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to delete category";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-500 text-left text-sm">
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium hidden sm:table-cell">Slug</th>
                <th className="py-3 px-4 font-medium hidden md:table-cell">Description</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="py-6 px-4 text-gray-500" colSpan={4}>Loading...</td>
                </tr>
              )}
              {!loading && categories.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-gray-500" colSpan={4}>No categories yet</td>
                </tr>
              )}
              {categories.map((cat) => (
                <tr key={cat.id || cat.slug} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{cat.name}</div>
                        {cat.description && (
                          <div className="text-sm text-gray-500 line-clamp-1 max-w-[280px]">{cat.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden sm:table-cell text-gray-600">{cat.slug}</td>
                  <td className="py-4 px-4 hidden md:table-cell text-gray-600">
                    <span className="line-clamp-1 max-w-[360px] inline-block">{cat.description || '-'}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onDelete(cat.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Delete"
                      >
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

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !submitting && setOpen(false)} />
          <div className="relative bg-white rounded-xl w-[95%] sm:w-[540px] max-w-[96vw] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create Category</h2>
              <button onClick={() => !submitting && setOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Electronics"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 min-h-[90px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-600"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}