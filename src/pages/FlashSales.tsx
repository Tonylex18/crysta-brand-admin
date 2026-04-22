import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "react-toastify";
import { flashSalesAPI } from "../lib/api";
import type { FlashSale } from "../lib/api";

type FlashSaleFormState = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  discountPercentage: string;
  startsAt: string;
  endsAt: string;
  isEnabled: boolean;
};

const initialFormState: FlashSaleFormState = {
  title: "",
  subtitle: "",
  ctaLabel: "",
  discountPercentage: "",
  startsAt: "",
  endsAt: "",
  isEnabled: true,
};

const toDateTimeLocal = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const fromDateTimeLocal = (value: string) => {
  if (!value) return "";
  return new Date(value).toISOString();
};

const formatDateRange = (sale: FlashSale) => {
  const formatter = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `${formatter.format(new Date(sale.startsAt))} - ${formatter.format(new Date(sale.endsAt))}`;
};

export default function FlashSalesPage() {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FlashSaleFormState>(initialFormState);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await flashSalesAPI.getAll();
      const rows = Array.isArray(response?.data) ? response.data : [];
      setSales(rows);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to load flash sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const activeSale = useMemo(() => {
    const now = Date.now();
    return sales.find((sale) => sale.isEnabled && new Date(sale.startsAt).getTime() <= now && new Date(sale.endsAt).getTime() >= now) || null;
  }, [sales]);

  const resetForm = () => {
    setEditingId(null);
    setForm(initialFormState);
  };

  const handleEdit = (sale: FlashSale) => {
    setEditingId(sale.id);
    setForm({
      title: sale.title,
      subtitle: sale.subtitle || "",
      ctaLabel: sale.ctaLabel || "",
      discountPercentage: String(sale.discountPercentage),
      startsAt: toDateTimeLocal(sale.startsAt),
      endsAt: toDateTimeLocal(sale.endsAt),
      isEnabled: sale.isEnabled,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await flashSalesAPI.delete(id);
      toast.success("Flash sale deleted");
      if (editingId === id) {
        resetForm();
      }
      await loadSales();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete flash sale");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        ctaLabel: form.ctaLabel.trim() || undefined,
        discountPercentage: Number(form.discountPercentage),
        startsAt: fromDateTimeLocal(form.startsAt),
        endsAt: fromDateTimeLocal(form.endsAt),
        isEnabled: form.isEnabled,
      };

      if (editingId) {
        await flashSalesAPI.update(editingId, payload);
        toast.success("Flash sale updated");
      } else {
        await flashSalesAPI.create(payload);
        toast.success("Flash sale created");
      }

      resetForm();
      await loadSales();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to save flash sale");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flash Sales</h1>
          <p className="text-sm text-gray-500">
            Schedule percentage promos that automatically apply to storefront pricing, cart, and checkout.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
          <span>New Flash Sale</span>
        </button>
      </div>

      {activeSale && (
        <div className="mb-6 rounded-2xl bg-[linear-gradient(120deg,#111827,#dc2626,#f97316)] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
                <Zap className="h-4 w-4" />
                Live Promo
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{activeSale.title}</h2>
              <p className="mt-2 text-sm text-white/80">{activeSale.subtitle || "This flash sale is currently active on the storefront."}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Discount</p>
              <p className="mt-2 text-3xl font-semibold">{activeSale.discountPercentage}% OFF</p>
              <p className="mt-2 text-sm text-white/80">{formatDateRange(activeSale)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? "Edit Flash Sale" : "Create Flash Sale"}</h2>
            <p className="text-sm text-gray-500">
              Only one enabled sale should run at a time. Enabling a new one will disable the previous enabled sale.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                placeholder="Flash sale title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Subtitle</label>
              <textarea
                value={form.subtitle}
                onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))}
                className="min-h-[96px] w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                placeholder="Optional message for the landing-page advert"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Discount Percentage</label>
              <input
                type="number"
                min="1"
                max="99"
                value={form.discountPercentage}
                onChange={(event) => setForm((current) => ({ ...current, discountPercentage: event.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                placeholder="10"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">CTA Label</label>
              <input
                value={form.ctaLabel}
                onChange={(event) => setForm((current) => ({ ...current, ctaLabel: event.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                placeholder="Shop Flash Sale"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Starts At</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ends At</label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                required
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
              <input
                id="isEnabled"
                type="checkbox"
                checked={form.isEnabled}
                onChange={(event) => setForm((current) => ({ ...current, isEnabled: event.target.checked }))}
              />
              <label htmlFor="isEnabled" className="text-sm text-gray-700">
                Enable this sale immediately when the date window is active
              </label>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving..." : editingId ? "Update Flash Sale" : "Create Flash Sale"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Scheduled Sales</h2>
            <p className="text-sm text-gray-500">Use this list to manage live and upcoming promos.</p>
          </div>

          {loading ? (
            <div className="py-10 text-sm text-gray-500">Loading flash sales...</div>
          ) : sales.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
              No flash sale configured yet.
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => {
                const now = Date.now();
                const startsAt = new Date(sale.startsAt).getTime();
                const endsAt = new Date(sale.endsAt).getTime();
                const status =
                  sale.isEnabled && startsAt <= now && endsAt >= now
                    ? "live"
                    : endsAt < now
                      ? "ended"
                      : sale.isEnabled
                        ? "scheduled"
                        : "disabled";

                return (
                  <div key={sale.id} className="rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900">{sale.title}</h3>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                              status === "live"
                                ? "bg-red-100 text-red-700"
                                : status === "scheduled"
                                  ? "bg-amber-100 text-amber-700"
                                  : status === "disabled"
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{formatDateRange(sale)}</p>
                        <p className="mt-3 text-sm text-gray-700">
                          {sale.discountPercentage}% off all qualifying storefront prices
                        </p>
                        {sale.subtitle && (
                          <p className="mt-2 text-sm text-gray-500">{sale.subtitle}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(sale)}
                          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                          title="Edit flash sale"
                        >
                          <Pencil className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="rounded-lg p-2 transition-colors hover:bg-red-50"
                          title="Delete flash sale"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
