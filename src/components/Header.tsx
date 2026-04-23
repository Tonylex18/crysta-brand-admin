import { Bell, Menu, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { adminNotificationAPI, type AdminNotification } from "../lib/api";

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const { adminId = "me" } = useParams();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminNotificationAPI.getNotifications();
      setNotifications(response.notifications || []);
      setUnreadCount(response.unread_count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const visibleNotifications = useMemo(() => notifications.slice(0, 8), [notifications]);

  return (
    <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onMenuClick} className="lg:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search something here"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 lg:gap-4">
          <div ref={panelRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="relative rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>

            {open ? (
              <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    <p className="text-xs text-gray-500">{unreadCount} unread</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await adminNotificationAPI.readAll();
                      await loadNotifications();
                    }}
                    className="text-xs font-semibold text-green-600 hover:text-green-700"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-6 text-sm text-gray-500">Loading notifications...</div>
                  ) : visibleNotifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-500">No notifications yet.</div>
                  ) : (
                    visibleNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={async () => {
                          if (!notification.is_read) {
                            await adminNotificationAPI.readNotification(notification.id);
                          }
                          setOpen(false);
                          await loadNotifications();
                          navigate(`/admin/${adminId}${notification.link || "/dashboard"}`);
                        }}
                        className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                          notification.is_read ? "bg-white" : "bg-green-50/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.is_read ? "bg-gray-300" : "bg-green-500"}`}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                            <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                            <p className="mt-2 text-xs text-gray-400">{formatRelativeTime(notification.created_at)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
              {admin?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="hidden md:block">
              <p className="font-semibold text-sm text-gray-900">{admin?.name || "Admin"}</p>
              <p className="text-xs text-gray-500">{admin?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
