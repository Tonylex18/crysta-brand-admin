import { useEffect, useMemo, useState } from "react";
import { Upload, ArrowLeft } from "lucide-react";
import { categoriesAPI, productsAPI } from "../lib/api";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
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
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCats = async () => {
      try {
        setLoadingCategories(true);
        const res = await categoriesAPI.getAll();
        const rows = Array.isArray(res) ? res : res?.data || [];
        setCategories(rows.map((r: any) => ({ id: r.id || r._id, name: r.name })));
      } catch (e: any) {
        toast.error(e?.message || "Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCats();
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await productsAPI.getById(id);
        const p = res?.data || res;
        setName(p.name || "");
        setPrice(String(p.price ?? ""));
        setCategoryId(p.category_id?._id || p.category_id || "");
        setDescription(p.description || "");
        setSizes(Array.isArray(p.sizes) ? p.sizes.join(", ") : (p.sizes || ""));
        setColors(Array.isArray(p.colors) ? p.colors.join(", ") : (p.colors || ""));
        setStock(String(p.stock ?? ""));
        setFeatured(!!p.featured);
        setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : "");
        setSku(p.sku || "");
        setWeight(p.weight ? String(p.weight) : "");
        setTags(Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || ""));
        setMetaTitle(p.metaTitle || "");
        setMetaDescription(p.metaDescription || "");
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Failed to load product";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const isValid = useMemo(() => {
    if (!name.trim()) return false;
    if (!price || Number.isNaN(parseFloat(price))) return false;
    if (!categoryId) return false;
    return true;
  }, [name, price, categoryId]);

  // const onSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!id || !isValid) return;
  //   try {
  //     setSubmitting(true);
  //     setError(null);
  //     const form = new FormData();
  //     form.append("name", name.trim());
  //     form.append("price", price);
  //     form.append("category_id", categoryId);
  //     if (description.trim()) form.append("description", description.trim());
  //     if (sizes.trim()) form.append("sizes", sizes.trim());
  //     if (colors.trim()) form.append("colors", colors.trim());
  //     if (stock) form.append("stock", stock);
  //     form.append("featured", String(featured));
  //     if (compareAtPrice) form.append("compareAtPrice", compareAtPrice);
  //     if (sku.trim()) form.append("sku", sku.trim());
  //     if (weight) form.append("weight", weight);
  //     if (tags.trim()) form.append("tags", tags.trim());
  //     if (metaTitle.trim()) form.append("metaTitle", metaTitle.trim());
  //     if (metaDescription.trim()) form.append("metaDescription", metaDescription.trim());
  //     if (imageFile) form.append("image_url", imageFile);
  //     if (imageFiles && imageFiles.length > 0) {
  //       imageFiles.forEach((f) => form.append("images", f));
  //     }

  //     await productsAPI.updateProduct(id, form);
  //     toast.success("Product updated successfully");
  //     navigate(-1);
  //   } catch (e: any) {
  //     const msg = e?.response?.data?.message || e?.message || "Failed to update product";
  //     setError(msg);
  //     toast.error(msg);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !isValid) return;
    try {
      setSubmitting(true);
      setError(null);
      const form = new FormData();

      // Required fields
      form.append("name", name.trim());
      form.append("price", price);
      form.append("category_id", categoryId);

      // Optional fields
      if (description.trim()) form.append("description", description.trim());

      // Convert comma-separated strings to arrays for backend
      if (sizes.trim()) {
        const sizesArray = sizes.split(',').map(s => s.trim()).filter(Boolean);
        form.append("sizes", JSON.stringify(sizesArray));
      }

      if (colors.trim()) {
        const colorsArray = colors.split(',').map(c => c.trim()).filter(Boolean);
        form.append("colors", JSON.stringify(colorsArray));
      }

      if (tags.trim()) {
        const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        form.append("tags", JSON.stringify(tagsArray));
      }

      if (stock) form.append("stock", stock);
      form.append("featured", String(featured));

      if (compareAtPrice) form.append("compareAtPrice", compareAtPrice);
      if (sku.trim()) form.append("sku", sku.trim());
      if (weight) form.append("weight", weight);

      if (metaTitle.trim()) form.append("metaTitle", metaTitle.trim());
      if (metaDescription.trim()) form.append("metaDescription", metaDescription.trim());

      // Images
      if (imageFile) form.append("image_url", imageFile);
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((f) => form.append("images", f));
      }

      console.log('Updating product with ID:', id);
      for (let [key, value] of form.entries()) {
        console.log(key, value);
      }

      const result = await productsAPI.updateProduct(id, form);
      console.log("Result: ", result);
      toast.success("Product updated successfully");
      navigate(-1);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to update product";
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
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
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300" required>
              <option value="" disabled>{loadingCategories ? "Loading..." : "Select a category"}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
            <div className="flex items-center gap-2">
              <input id="featured" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <label htmlFor="featured" className="text-sm text-gray-700">Mark as featured</label>
            </div>
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
                <input id="editMainImageInput" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                <button type="button" onClick={() => document.getElementById('editMainImageInput')?.click()} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Select image</button>
                {imageFile && (
                  <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-14 h-14 rounded-md object-cover border" />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images</label>
              <input id="editGalleryInput" type="file" accept="image/*" multiple onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImageFiles(prev => [...prev, ...files]);
              }} className="hidden" />
              <div className="flex items-center gap-3 mb-3">
                <button type="button" onClick={() => document.getElementById('editGalleryInput')?.click()} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Add images</button>
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
            <button type="submit" disabled={!isValid || submitting} onClick={() => { /* noop */ }} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-60 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}


