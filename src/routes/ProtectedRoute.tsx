import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../store";

export default function ProtectedRoute({ role }: { role?: "admin" | "customer" }) {
  const { user, token } = useStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const userRole = user.role.toLowerCase();
    const isAdminRole = userRole === "admin" || userRole === "super_admin" || userRole === "demo_admin";
    const isCustomerRole = userRole === "customer" || userRole === "demo_customer";

    if (role === "admin" && !isAdminRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center p-8 border border-red-500/30 rounded-2xl bg-zinc-900/50 max-w-md">
            <h1 className="text-3xl font-bold font-mono text-red-500 mb-4">403 Forbidden</h1>
            <p className="text-zinc-400 font-sans mb-6">Anda tidak memiliki izin (role admin/super_admin) untuk mengakses halaman ini.</p>
            <a href="/" className="inline-block px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition font-sans text-sm">Kembali ke Beranda</a>
          </div>
        </div>
      );
    }
    if (role === "customer" && !isCustomerRole) {
      // Admin should be able to navigate the customer side for testing or we force them out
      // Usually admins are NOT customers. We'll redirect admin from customer routes
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
