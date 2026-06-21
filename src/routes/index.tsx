import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CustomerDashboard from "../pages/customer/Dashboard";
import CatalogPage from "../pages/customer/CatalogPage";
import CartCheckoutPage from "../pages/customer/CartCheckoutPage";
import BookingHistoryPage from "../pages/customer/BookingHistoryPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";

import AboutPage from "../pages/AboutPage";
import TermsPage from "../pages/TermsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/terms", element: <TermsPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      {
        path: "/customer",
        element: <ProtectedRoute role="customer" />,
        children: [
          { path: "", element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <CustomerDashboard /> },
          { path: "catalog", element: <CatalogPage /> },
          { path: "checkout", element: <CartCheckoutPage /> },
          { path: "bookings", element: <BookingHistoryPage /> },
          { path: "profile", element: <CustomerDashboard /> },
        ]
      },
      {
        path: "/admin",
        element: <ProtectedRoute role="admin" />,
        children: [
          { path: "", element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "*", element: <Navigate to="dashboard" replace /> },
        ]
      }
    ]
  }
]);
