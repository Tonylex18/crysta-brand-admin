import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { admin } = useAuth();

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
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
              {admin?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block">
              <p className="font-semibold text-sm text-gray-900">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{admin?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}