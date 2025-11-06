import { useMemo, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { DashboardPage } from "./pages/Dashboard";
import { ProductsPage } from "./pages/Product";
import { CustomersPage } from "./pages/Customer";
import { SettingsPage } from "./pages/Setting";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { OrdersPage } from "./pages/Order";
import AuthPage from "./pages/auth";
import Verifyemail from "./pages/VerifyMail";
import Coupon from "./pages/Coupon";
import Chats from "./pages/Chats";
import ProductAddPage from "./pages/ProductAdd";
import ProductEditPage from "./pages/ProductEdit";
import Categories from "./pages/Category";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function ProtectedLayout() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const adminId = params.adminId || admin?.id || "";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!admin) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Extract current page from URL pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPage = pathSegments[pathSegments.length - 1] || "dashboard";

  const handleNavigate = (page: string) => {
    navigate(`/admin/${adminId}/${page}`);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="category" element={<Categories />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/add" element={<ProductAddPage />} />
            <Route path="products/:id/edit" element={<ProductEditPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="coupons" element={<Coupon />} />
            <Route path="chats" element={<Chats />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      </div>
    </div>
  );
}

export default function App() {
  const { admin, loading } = useAuth();
  const defaultAdminId = useMemo(() => admin?.id || "me", [admin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path='/verify-email' element={<Verifyemail />} />
      <Route path="/admin/:adminId/*" element={<ProtectedLayout />} />
      <Route
        path="/dashboard"
        element={<Navigate to={`/admin/${defaultAdminId}/dashboard`} replace />}
      />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}