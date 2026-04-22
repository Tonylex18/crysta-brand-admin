import { useEffect, useMemo, useState } from "react";
import { Upload, ArrowLeft, ChevronDown } from "lucide-react";
import { categoriesAPI, productsAPI, subcategoriesAPI } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ProductAddPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
  const [stock, setStock] = useState("");
  const [featured, setFeatured] = useState(false);
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [sku, setSku] = useState("");
  const [weight, setWeight] = useState("");
  const [tags, setTags] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCats = async () => {
      try {
        setLoadingCategories(true);
        const res = await categoriesAPI.getAll({ parent_id: "null" });
        const rows = Array.isArray(res) ? res : res?.data || [];
        setCategories(rows.map((r: any) => ({ id: r.id || r._id, name: r.name })));
      } catch (e: any) {
        const msg = e?.message || "Failed to load categories";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCats();
  }, []);

  useEffect(() => {
    const loadSubs = async () => {
      if (!parentCategoryId) {
        setSubcategories([]);
        setSubcategoryId("");
        return;
      }
      try {
        setLoadingSubcategories(true);
        const res = await subcategoriesAPI.getAll({ parent_id: parentCategoryId });
        const rows = Array.isArray(res) ? res : res?.data || [];
        setSubcategories(rows.map((r: any) => ({ id: r.id || r._id, name: r.name })));
      } catch (e: any) {
        toast.error(e?.message || "Failed to load subcategories");
        setSubcategories([]);
      } finally {
        setLoadingSubcategories(false);
      }
    };
    loadSubs();
  }, [parentCategoryId]);

  const isValid = useMemo(() => {
    if (!name.trim()) return false;
    if (!price || Number.isNaN(parseFloat(price))) return false;
    if (!parentCategoryId) return false;
    if (!subcategoryId) return false;
    return true;
  }, [name, price, parentCategoryId, subcategoryId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      setSubmitting(true);
      setError(null);
      const form = new FormData();
      form.append("name", name.trim());
      form.append("price", price);
      form.append("category_id", subcategoryId);
      if (description.trim()) form.append("description", description.trim());
      if (sizes.trim()) form.append("sizes", sizes.trim());
      if (colors.trim()) form.append("colors", colors.trim());
      if (stock) form.append("stock", stock);
      form.append("featured", String(featured));
      if (compareAtPrice) form.append("compareAtPrice", compareAtPrice);
      if (sku.trim()) form.append("sku", sku.trim());
      if (weight) form.append("weight", weight);
      if (tags.trim()) form.append("tags", tags.trim());
      if (metaTitle.trim()) form.append("metaTitle", metaTitle.trim());
      if (metaDescription.trim()) form.append("metaDescription", metaDescription.trim());
      if (imageFile) form.append("image_url", imageFile);
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((f) => form.append("images", f));
      }

      await productsAPI.addProduct(form);
      navigate(-1);
      toast.success("Product added successfully");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to add product";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="Product name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="0.00" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <div className="relative">
            <select
              value={parentCategoryId}
              onChange={(e) => {
                setParentCategoryId(e.target.value);
                setSubcategoryId("");
              }}
              className="w-full h-10 px-3 pr-10 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300 appearance-none"
              required
            >
              <option value="" disabled>{loadingCategories ? "Loading..." : "Select a category"}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {!loadingCategories && categories.length === 0 && (
            <div className="text-xs text-gray-500 mt-1">No categories found. Create one in Categories.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
          <div className="relative">
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              className="w-full h-10 px-3 pr-10 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300 appearance-none"
              required
              disabled={!parentCategoryId || loadingSubcategories}
            >
              <option value="" disabled>
                {!parentCategoryId
                  ? "Select a category first"
                  : loadingSubcategories
                    ? "Loading..."
                    : "Select a subcategory"}
              </option>
              {subcategories.map((sc) => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {!loadingSubcategories && parentCategoryId && subcategories.length === 0 && (
            <div className="text-xs text-gray-500 mt-1">No subcategories found. Create one in Categories.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="0" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 min-h-[100px]" placeholder="Describe your product" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma-separated)</label>
          <input value={sizes} onChange={(e) => setSizes(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="S, M, L" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Colors (comma-separated)</label>
          <input value={colors} onChange={(e) => setColors(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="Red, Blue" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Compare at Price</label>
          <input type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="Optional" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="Optional" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="Optional" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="tag1, tag2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Landing Page Placement</label>
          <div className="flex items-center gap-2">
            <input id="featured" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <label htmlFor="featured" className="text-sm text-gray-700">Show in featured products section</label>
          </div>
          <p className="mt-1 text-xs text-gray-500">If unchecked, the product stays out of the featured section and appears only under new arrivals.</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <input value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="Optional" />
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Main Image</label>
            <div className="flex items-center gap-3">
              <input id="mainImageInput" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" />
              <button type="button" onClick={() => document.getElementById('mainImageInput')?.click()} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Select image</button>
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-14 h-14 rounded-md object-cover border" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images</label>
            <input id="galleryInput" type="file" accept="image/*" multiple onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setImageFiles(prev => [...prev, ...files]);
            }} className="hidden" />
            <div className="flex items-center gap-3 mb-3">
              <button type="button" onClick={() => document.getElementById('galleryInput')?.click()} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Add images</button>
              {imageFiles.length > 0 && (
                <span className="text-xs text-gray-500">{imageFiles.length} selected</span>
              )}
            </div>
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {imageFiles.map((f, idx) => (
                  <div key={idx} className="relative group">
                    <img src={URL.createObjectURL(f)} alt={`img-${idx}`} className="w-16 h-16 object-cover rounded border" />
                    <button type="button" onClick={() => setImageFiles(imageFiles.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 text-xs hidden group-hover:block">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 pt-2 flex items-center justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50" disabled={submitting}>Cancel</button>
          <button type="submit" disabled={!isValid || submitting} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-60 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {submitting ? "Submitting..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
