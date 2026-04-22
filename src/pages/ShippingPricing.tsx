import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { locationsAPI, shippingAPI } from "../lib/api";
import type { LocationState, ShippingRate, ShippingSettings } from "../lib/api";

type Preview = {
  base_fee: number;
  buffer_fee: number;
  final_fee: number;
};

const formatNaira = (kobo: number) =>
  `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const toKobo = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
};

const fromKobo = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "";
  return (value / 100).toString();
};

export default function ShippingPricing() {
  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingRate, setSavingRate] = useState(false);
  const [states, setStates] = useState<LocationState[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    buffer_percentage: "",
    default_fee: "",
    minimum_fee: "",
  });

  const [rateForm, setRateForm] = useState({
    state: "",
    base_fee: "",
    is_active: true,
  });

  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const configured = useMemo(() => {
    return (
      settings?.buffer_percentage !== null &&
      settings?.buffer_percentage !== undefined &&
      settings?.default_fee !== null &&
      settings?.default_fee !== undefined &&
      settings?.minimum_fee !== null &&
      settings?.minimum_fee !== undefined
    );
  }, [settings]);

  const load = async () => {
    try {
      setLoading(true);
      setStatesLoading(true);
      const [settingsRes, ratesRes, statesRes] = await Promise.all([
        shippingAPI.getSettings(),
        shippingAPI.getRates(),
        locationsAPI.getStates(),
      ]);
      const newSettings: ShippingSettings | null = settingsRes?.settings || null;
      setSettings(newSettings);
      setSettingsForm({
        buffer_percentage: newSettings?.buffer_percentage?.toString() || "",
        default_fee: fromKobo(newSettings?.default_fee),
        minimum_fee: fromKobo(newSettings?.minimum_fee),
      });
      setRates(ratesRes?.rates || []);
      setStates(statesRes?.states || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load shipping pricing");
    } finally {
      setLoading(false);
      setStatesLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!configured) {
        setPreview(null);
        return;
      }
      if (!rateForm.base_fee) {
        setPreview(null);
        return;
      }
      const baseFeeKobo = toKobo(rateForm.base_fee);
      if (baseFeeKobo === null) {
        setPreview(null);
        return;
      }
      try {
        setPreviewLoading(true);
        const res = await shippingAPI.preview({ base_fee: baseFeeKobo });
        setPreview(res);
      } catch (e: any) {
        setPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    };
    run();
  }, [rateForm.base_fee, configured]);

  const saveSettings = async () => {
    const buffer = Number(settingsForm.buffer_percentage);
    const defaultFeeKobo = toKobo(settingsForm.default_fee);
    const minimumFeeKobo = toKobo(settingsForm.minimum_fee);
    if (!Number.isFinite(buffer) || defaultFeeKobo === null || minimumFeeKobo === null) {
      toast.error("Please provide valid settings values");
      return;
    }
    try {
      setSavingSettings(true);
      const res = await shippingAPI.updateSettings({
        buffer_percentage: buffer,
        default_fee: defaultFeeKobo,
        minimum_fee: minimumFeeKobo,
      });
      setSettings(res?.settings || null);
      toast.success("Shipping settings saved");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const saveRate = async () => {
    if (!rateForm.state.trim()) {
      toast.error("State is required");
      return;
    }
    const baseFeeKobo = toKobo(rateForm.base_fee);
    if (baseFeeKobo === null) {
      toast.error("Base fee is required");
      return;
    }
    try {
      setSavingRate(true);
      await shippingAPI.upsertRate({
        state: rateForm.state.trim(),
        base_fee: baseFeeKobo,
        is_active: rateForm.is_active,
      });
      setRateForm({ state: "", base_fee: "", is_active: true });
      await load();
      toast.success("Shipping rate saved");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to save rate");
    } finally {
      setSavingRate(false);
    }
  };

  const removeRate = async (id: string) => {
    try {
      await shippingAPI.deleteRate(id);
      await load();
      toast.success("Rate removed");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to delete rate");
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shipping Pricing</h1>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {!configured && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          Shipping system not configured. Please add settings to enable shipping.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Global Settings</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default fee (NGN)</label>
            <input
              value={settingsForm.default_fee}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, default_fee: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Enter default fee"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buffer percentage</label>
            <input
              value={settingsForm.buffer_percentage}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, buffer_percentage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Enter buffer percentage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum fee (NGN)</label>
            <input
              value={settingsForm.minimum_fee}
              onChange={(e) => setSettingsForm((prev) => ({ ...prev, minimum_fee: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Enter minimum fee"
            />
          </div>
          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="w-full px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-60"
          >
            {savingSettings ? "Saving..." : "Save settings"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">State Rates</h2>
              <span className="text-xs text-gray-400">Saved rates: {rates.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_140px] gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <div className="relative">
                <select
                  value={rateForm.state}
                  onChange={(e) => setRateForm((prev) => ({ ...prev, state: e.target.value }))}
                  className="w-full h-10 px-3 pr-10 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300 appearance-none"
                  disabled={!configured || statesLoading || states.length === 0}
                >
                  <option value="">
                    {statesLoading ? "Loading states..." : "Select state"}
                  </option>
                  {states.map((state) => (
                    <option key={state.id} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base fee (NGN)</label>
                <input
                  value={rateForm.base_fee}
                  onChange={(e) => setRateForm((prev) => ({ ...prev, base_fee: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                  placeholder="Enter base fee"
                  disabled={!configured}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="rateActive"
                  type="checkbox"
                  checked={rateForm.is_active}
                  onChange={(e) => setRateForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  disabled={!configured}
                />
                <label htmlFor="rateActive" className="text-sm text-gray-700">Active</label>
              </div>
            </div>

            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <button
                onClick={saveRate}
                disabled={!configured || savingRate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                {savingRate ? "Saving..." : "Add / Update Rate"}
              </button>
              <div className="text-sm text-gray-500">
                Preview:{" "}
                {previewLoading ? (
                  <span>Calculating...</span>
                ) : preview ? (
                  <span>
                    Base {formatNaira(preview.base_fee)} • Buffer {formatNaira(preview.buffer_fee)} • Final{" "}
                    {formatNaira(preview.final_fee)}
                  </span>
                ) : (
                  <span>Enter a base fee to preview</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-gray-500 text-left text-sm">
                    <th className="py-3 px-4 font-medium">State</th>
                    <th className="py-3 px-4 font-medium">Base fee (NGN)</th>
                    <th className="py-3 px-4 font-medium">Active</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td className="py-6 px-4 text-gray-500" colSpan={4}>Loading...</td>
                    </tr>
                  )}
                  {!loading && rates.length === 0 && (
                    <tr>
                      <td className="py-6 px-4 text-gray-500" colSpan={4}>No rates yet</td>
                    </tr>
                  )}
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{rate.state}</td>
                      <td className="py-4 px-4 text-gray-600">{formatNaira(rate.base_fee)}</td>
                      <td className="py-4 px-4 text-gray-600">{rate.is_active ? "Yes" : "No"}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => removeRate(rate.id)}
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
        </div>
      </div>
    </div>
  );
}
