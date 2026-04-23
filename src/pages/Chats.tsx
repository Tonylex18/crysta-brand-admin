import { Mail, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { contactMessagesAPI, type ContactMessage } from "../lib/api";

type MessageStatus = "all" | "new" | "read" | "closed";

const statusOptions: Array<{ value: Exclude<MessageStatus, "all">; label: string }> = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "closed", label: "Closed" },
];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "closed":
      return "bg-gray-100 text-gray-700";
    case "read":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

const Chats = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<MessageStatus>("all");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await contactMessagesAPI.list();
      const list = response.messages || [];
      setMessages(list);
      setSelectedMessageId((current) => current ?? list[0]?.id ?? null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to load customer messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    if (activeFilter === "all") return messages;
    return messages.filter((message) => message.status === activeFilter);
  }, [messages, activeFilter]);

  const selectedMessage =
    filteredMessages.find((message) => message.id === selectedMessageId) ||
    messages.find((message) => message.id === selectedMessageId) ||
    filteredMessages[0] ||
    messages[0] ||
    null;

  const counts = useMemo(
    () => ({
      all: messages.length,
      new: messages.filter((message) => message.status === "new").length,
      read: messages.filter((message) => message.status === "read").length,
      closed: messages.filter((message) => message.status === "closed").length,
    }),
    [messages],
  );

  const updateStatus = async (messageId: string, status: Exclude<MessageStatus, "all">) => {
    try {
      setUpdatingId(messageId);
      await contactMessagesAPI.updateStatus(messageId, status);
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? {
                ...message,
                status,
                updated_at: new Date().toISOString(),
              }
            : message,
        ),
      );
      toast.success(`Message marked as ${status}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update message status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review messages from the contact page and track their handling status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadMessages()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { key: "all", label: "All Messages" },
          { key: "new", label: "New" },
          { key: "read", label: "Read" },
          { key: "closed", label: "Closed" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveFilter(item.key as MessageStatus)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              activeFilter === item.key ? "border-green-400 bg-green-50" : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {counts[item.key as keyof typeof counts]}
            </p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-4">
            <p className="text-sm font-semibold text-gray-900">Inbox</p>
            <p className="text-xs text-gray-500">
              {filteredMessages.length} message{filteredMessages.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="max-h-[640px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">Loading messages...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No messages found for this filter.</div>
            ) : (
              filteredMessages.map((message) => (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => setSelectedMessageId(message.id)}
                  className={`w-full border-b border-gray-100 px-4 py-4 text-left transition-colors last:border-b-0 ${
                    selectedMessage?.id === message.id ? "bg-green-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{message.name}</p>
                      <p className="truncate text-sm text-gray-500">{message.email}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(message.status)}`}>
                      {message.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-3 truncate text-sm font-medium text-gray-700">{message.subject}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{message.message}</p>
                  <p className="mt-3 text-xs text-gray-400">{formatDate(message.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          {selectedMessage ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-gray-200 px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedMessage.subject}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{selectedMessage.name}</span>
                      <span>{selectedMessage.email}</span>
                      <span>{formatDate(selectedMessage.created_at)}</span>
                    </div>
                  </div>
                  <span className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(selectedMessage.status)}`}>
                    {selectedMessage.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-1 px-6 py-6">
                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{selectedMessage.message}</p>
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Mail className="h-4 w-4" />
                    Reply by email
                  </a>

                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={updatingId === selectedMessage.id || selectedMessage.status === option.value}
                      onClick={() => void updateStatus(selectedMessage.id, option.value)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                        option.value === "closed"
                          ? "bg-gray-900 text-white hover:bg-gray-800"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {updatingId === selectedMessage.id && selectedMessage.status !== option.value
                        ? "Updating..."
                        : `Mark as ${option.label}`}
                    </button>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Received</p>
                    <p className="mt-2 text-sm text-gray-700">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Last Updated</p>
                    <p className="mt-2 text-sm text-gray-700">{formatDate(selectedMessage.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[360px] items-center justify-center px-6 text-center text-sm text-gray-500">
              No customer message is available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
