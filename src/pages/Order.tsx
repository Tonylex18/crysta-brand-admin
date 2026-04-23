import { Eye, Search, X } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ordersAPI, resolveImageUrl } from "../lib/api";

type OrderLineItem = {
  id: string;
  name: string;
  quantity: number;
  priceKobo: number;
  imageUrl?: string;
  images: string[];
  selectedSize?: string;
  selectedColor?: string;
};

type OrderAddress = {
  state: string;
  city: string;
  street: string;
  landmark?: string;
  phone: string;
};

type Order = {
  id: string;
  orderNo: string;
  date: string;
  customer: string;
  itemCount: number;
  paymentStatus: string;
  paymentReference?: string;
  status: string;
  total: number;
  address?: OrderAddress | null;
  items: OrderLineItem[];
};

type PreviewItem = {
  name: string;
  images: string[];
  activeImage: string;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (value: string) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ordersAPI.getAllOrders();
      const list = Array.isArray(res) ? res : res?.orders || res?.data || [];
      const normalized: Order[] = list.map((o: any) => {
        const rawId = String(o.id || o._id || "");
        const rawItems = Array.isArray(o.items) ? o.items : Array.isArray(o.products) ? o.products : [];
        const normalizedItems: OrderLineItem[] = rawItems.map((item: any) => ({
          id: String(item.id || item._id || `${rawId}-${item.product_id || item.productId || item.name}`),
          name: item.name || item.product_name || "Item",
          quantity: Number(item.quantity || 0) || 0,
          priceKobo: Number(item.price_kobo || item.priceKobo || 0) || 0,
          imageUrl: item.image_url || item.imageUrl || undefined,
          images: Array.isArray(item.images) ? item.images : [],
          selectedSize: item.selected_size || item.selectedSize || undefined,
          selectedColor: item.selected_color || item.selectedColor || undefined,
        }));

        return {
          id: rawId,
          orderNo: o.orderNo || o.orderNumber || `#${rawId.slice(-8).toUpperCase()}`,
          date: o.created_at || o.createdAt || "",
          customer: o.user?.name || o.user?.email || o.customer?.name || "Customer",
          itemCount: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
          paymentStatus: o.payment?.status || o.payment_status || o.paymentStatus || "pending",
          paymentReference: o.payment?.reference || o.payment_reference || undefined,
          status: (o.status === "pending_fulfillment" ? "pending" : o.status) || "pending",
          total: o.totals?.grand_total_kobo ? o.totals.grand_total_kobo / 100 : o.total || o.totalAmount || 0,
          address: o.address || o.shipping_address || null,
          items: normalizedItems,
        };
      });
      setOrders(normalized);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load orders";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pending = orders.filter((order) => order.status === "pending").length;
    const completed = orders.filter((order) => ["complete", "completed", "delivered"].includes(order.status)).length;
    const cancelled = orders.filter((order) => order.status === "cancelled").length;
    return { totalOrders, pending, completed, cancelled };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) => {
      const itemMatch = order.items.some((item) => item.name.toLowerCase().includes(query));
      return (
        order.orderNo.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query) ||
        order.paymentStatus.toLowerCase().includes(query) ||
        (order.paymentReference || "").toLowerCase().includes(query) ||
        itemMatch
      );
    });
  }, [orders, searchTerm]);

  const paymentBadgeClass = (status: string) => {
    switch (status) {
      case "success":
      case "paid":
        return "bg-green-100 text-green-700";
      case "refund_pending":
        return "bg-yellow-100 text-yellow-700";
      case "refunded":
        return "bg-emerald-100 text-emerald-700";
      case "refund_failed":
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const formatPaymentLabel = (status: string) => {
    if (status === "refund_pending") return "Refund Pending";
    if (status === "refund_failed") return "Refund Failed";
    return status.replace(/_/g, " ").toUpperCase();
  };

  const openPreview = (item: OrderLineItem) => {
    const images = Array.from(new Set([item.imageUrl, ...item.images].filter(Boolean) as string[]));
    if (images.length === 0) {
      toast.info(`No image available yet for ${item.name}`);
      return;
    }

    setPreviewItem({
      name: item.name,
      images,
      activeImage: images[0],
    });
  };

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
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by order, customer, item, or payment reference..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Refresh
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
                <th className="py-3 px-4 font-medium">Payment</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Total</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr>
                  <td className="py-4 px-4 text-red-600" colSpan={8}>
                    {error}
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className="py-4 px-4 text-gray-500" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && !error && filteredOrders.length === 0 && (
                <tr>
                  <td className="py-4 px-4 text-gray-500" colSpan={8}>
                    No orders match the current search.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <Fragment key={order.id}>
                      <tr className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{order.orderNo}</td>
                        <td className="py-4 px-4 text-gray-600">{formatDate(order.date)}</td>
                        <td className="py-4 px-4 text-gray-900">{order.customer}</td>
                        <td className="py-4 px-4 text-gray-600">{order.itemCount} item(s)</td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${paymentBadgeClass(order.paymentStatus)}`}>
                              {formatPaymentLabel(order.paymentStatus)}
                            </span>
                            {order.paymentReference ? (
                              <p className="text-xs text-gray-500">{order.paymentReference}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={order.status}
                            onChange={async (e) => {
                              const next = e.target.value;
                              try {
                                if (next === "cancelled") {
                                  const res = await ordersAPI.cancelOrder(order.id);
                                  const nextStatus = res?.status || res?.order_status || "cancelled";
                                  const nextPayment = res?.payment?.status || res?.payment_status || order.paymentStatus;
                                  setOrders((prev) =>
                                    prev.map((entry) =>
                                      entry.id === order.id ? { ...entry, status: nextStatus, paymentStatus: nextPayment } : entry,
                                    ),
                                  );
                                  toast.success(`Order ${order.orderNo} cancelled`);
                                } else {
                                  await ordersAPI.updateOrderStatus(order.id, next);
                                  setOrders((prev) =>
                                    prev.map((entry) => (entry.id === order.id ? { ...entry, status: next } : entry)),
                                  );
                                  toast.success(`Order ${order.orderNo} updated to ${next}`);
                                }
                              } catch (err: any) {
                                toast.error(err?.response?.data?.message || err?.message || "Failed to update order");
                              }
                            }}
                            className="px-2 py-1 border border-gray-200 rounded"
                          >
                            {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900 font-medium">{formatCurrency(order.total)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedOrderId((current) => (current === order.id ? null : order.id))}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                              {isExpanded ? "Hide" : "View"}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="border-b bg-gray-50/70">
                          <td colSpan={8} className="px-4 py-5">
                            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Order Items</p>
                                    <h3 className="mt-1 text-lg font-semibold text-gray-900">{order.orderNo}</h3>
                                  </div>
                                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                    {order.itemCount} unit(s)
                                  </span>
                                </div>

                                <div className="mt-4 space-y-3">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-gray-200 p-4">
                                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex gap-4">
                                          <button
                                            type="button"
                                            onClick={() => openPreview(item)}
                                            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
                                            title={`Preview ${item.name}`}
                                          >
                                            {item.imageUrl ? (
                                              <img
                                                src={resolveImageUrl(item.imageUrl)}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                              />
                                            ) : (
                                              <span className="px-2 text-center text-[11px] font-medium text-gray-400">
                                                No image
                                              </span>
                                            )}
                                          </button>
                                          <div>
                                            <p className="font-semibold text-gray-900">{item.name}</p>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-gray-600">
                                              <span className="rounded-full bg-gray-100 px-2.5 py-1">Qty: {item.quantity}</span>
                                              <span className="rounded-full bg-gray-100 px-2.5 py-1">
                                                Size: {item.selectedSize || "Not selected"}
                                              </span>
                                              <span className="rounded-full bg-gray-100 px-2.5 py-1">
                                                Color: {item.selectedColor || "Not selected"}
                                              </span>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => openPreview(item)}
                                              className="mt-3 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                                            >
                                              <Eye className="h-3.5 w-3.5" />
                                              Preview item
                                            </button>
                                          </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                          <p className="text-sm text-gray-500">Unit price</p>
                                          <p className="font-semibold text-gray-900">{formatCurrency(item.priceKobo / 100)}</p>
                                          <p className="mt-1 text-xs text-gray-500">
                                            Line total {formatCurrency((item.priceKobo * item.quantity) / 100)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Delivery</p>
                                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                                    <p>{order.address?.street || "No street provided"}</p>
                                    <p>
                                      {[order.address?.city, order.address?.state].filter(Boolean).join(", ") || "No location provided"}
                                    </p>
                                    {order.address?.landmark ? <p>Landmark: {order.address.landmark}</p> : null}
                                    <p>Phone: {order.address?.phone || "No phone provided"}</p>
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Payment & Fulfilment</p>
                                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                                    <p>Status: {formatPaymentLabel(order.paymentStatus)}</p>
                                    <p>Reference: {order.paymentReference || "Not available"}</p>
                                    <p>Order date: {formatDate(order.date)}</p>
                                    <p>Total: {formatCurrency(order.total)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {previewItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close preview"
            onClick={() => setPreviewItem(null)}
          />
          <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Item Preview</p>
                <h3 className="mt-1 text-xl font-semibold text-gray-900">{previewItem.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-[#f7f7f7]">
              <img
                src={resolveImageUrl(previewItem.activeImage)}
                alt={previewItem.name}
                className="h-[420px] w-full object-contain"
              />
            </div>

            {previewItem.images.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {previewItem.images.map((image) => {
                  const resolved = resolveImageUrl(image);
                  const isActive = previewItem.activeImage === image;
                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() =>
                        setPreviewItem((current) =>
                          current ? { ...current, activeImage: image } : current,
                        )
                      }
                      className={`overflow-hidden rounded-2xl border ${isActive ? "border-gray-900" : "border-gray-200"}`}
                    >
                      <img src={resolved} alt={previewItem.name} className="h-20 w-20 object-cover" />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
