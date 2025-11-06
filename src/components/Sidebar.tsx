import { BarChart3, LogOut, MessageSquare, Package, Settings, ShoppingBasket, ShoppingCart, Tag, Users, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onClose?: () => void;
}

export const Sidebar = ({ currentPage, onNavigate, onClose }: SidebarProps) => {
  const { signOut } = useAuth();

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    page,
    badge 
  }: { 
    icon: any; 
    label: string; 
    page: string;
    badge?: string;
  }) => (
    <div
      onClick={() => {
        onNavigate(page);
        onClose?.();
      }}
      className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${
        currentPage === page ? 'bg-green-300 text-gray-900' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className="bg-teal-700 text-white text-xs font-bold px-2 py-1 rounded">
          {badge}
        </span>
      )}
    </div>
  );

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-gray-700" />
            <span className="text-xl font-bold text-gray-900">Crysta</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 mb-3 px-2">MENU</p>
          <div className="space-y-1">
            <MenuItem icon={BarChart3} label="Dashboard" page="dashboard" />
            <MenuItem icon={ShoppingBasket} label="Category" page="category" />
            <MenuItem icon={Package} label="Products" page="products" />
            <MenuItem icon={Users} label="Customers" page="customers" />
            <MenuItem icon={ShoppingCart} label="Orders" page="orders" />
            <MenuItem icon={Tag} label="Coupons" page="coupons" />
            <MenuItem icon={MessageSquare} label="Chats" page="chats" badge="4" />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-3 px-2">OTHER</p>
          <div className="space-y-1">
            <MenuItem icon={Settings} label="Settings" page="settings" />
            <div
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}