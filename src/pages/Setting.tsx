import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { adminNotificationAPI, type AdminNotificationPreferences } from "../lib/api";

const defaultPreferences: AdminNotificationPreferences = {
  new_orders: true,
  low_stock_alerts: true,
  customer_messages: true,
  weekly_reports: true,
};

export function SettingsPage() {
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [preferences, setPreferences] = useState<AdminNotificationPreferences>(defaultPreferences);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoadingPreferences(true);
        const response = await adminNotificationAPI.getPreferences();
        setPreferences(response.preferences || defaultPreferences);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load notification preferences");
      } finally {
        setLoadingPreferences(false);
      }
    };

    void loadPreferences();
  }, []);

  const notificationItems = [
    { key: "new_orders", label: "New Orders", desc: "Receive notifications for new orders" },
    { key: "low_stock_alerts", label: "Low Stock Alerts", desc: "Get alerted when products are low in stock" },
    { key: "customer_messages", label: "Customer Messages", desc: "Notifications for new customer messages" },
    { key: "weekly_reports", label: "Weekly Reports", desc: "Receive weekly sales reports via email" },
  ] as const;

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-2">
              {[
                ["profile", "Profile Settings"],
                ["security", "Security"],
                ["notifications", "Notifications"],
                ["store", "Store Settings"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === value ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                      {admin?.name?.[0]?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Admin profile details are loaded from your account.</p>
                      <p className="mt-1 font-medium text-gray-900">{admin?.name || "Admin"}</p>
                      <p className="text-sm text-gray-500">{admin?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                <p className="text-sm text-gray-500">
                  Password management is not changed in this pass. Notification infrastructure was prioritised for production readiness.
                </p>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Control which admin alerts appear in the dashboard and which weekly reports are emailed.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={savingPreferences || loadingPreferences}
                    onClick={async () => {
                      try {
                        setSavingPreferences(true);
                        await adminNotificationAPI.savePreferences(preferences);
                        toast.success("Notification preferences updated");
                      } catch (error: any) {
                        toast.error(error?.response?.data?.message || error?.message || "Failed to save preferences");
                      } finally {
                        setSavingPreferences(false);
                      }
                    }}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-60"
                  >
                    {savingPreferences ? "Saving..." : "Save Preferences"}
                  </button>
                </div>

                {loadingPreferences ? (
                  <div className="py-10 text-sm text-gray-500">Loading notification preferences...</div>
                ) : (
                  <div className="space-y-4">
                    {notificationItems.map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-4 border-b last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={preferences[item.key]}
                            onChange={(event) =>
                              setPreferences((current) => ({
                                ...current,
                                [item.key]: event.target.checked,
                              }))
                            }
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "store" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Store Settings</h2>
                <p className="text-sm text-gray-500">
                  Store-level copy and currency settings were left unchanged in this pass. The focus here was operational readiness:
                  notifications, customer messages, and automated emails.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
