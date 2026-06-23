import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { PATHS } from './paths'
import MainLayout from '../components/layout/MainLayout'
import AuthLayout from '../components/layout/AuthLayout'
import HomePage from '../pages/home/HomePage'
import AiResultPage from '../pages/home/AiResultPage'
import LegitResultPage from '../pages/ai/LegitResultPage'
import WomenCategoryPage from '../pages/category/WomenCategoryPage'
import MenCategoryPage from '../pages/category/MenCategoryPage'

import BrandsCategoryPage from '../pages/category/BrandsCategoryPage'
import SportCategoryPage from '../pages/category/SportCategoryPage'
import ProductDetailPage from '../pages/products/ProductDetailPage'
import CartPage from '../pages/cart/CartPage'
import ContactPage from '../pages/contact/ContactPage'
import AboutPage from '../pages/info/AboutPage'
import HelpCenterPage from '../pages/info/HelpCenterPage'
import ReturnPolicyPage from '../pages/info/ReturnPolicyPage'
import ReportBugPage from '../pages/info/ReportBugPage'
import VnpayReturnPage from '../pages/payment/VnpayReturnPage'
import SepayCheckoutPage from '../pages/payment/SepayCheckoutPage'
import OrderHistoryPage from '../pages/orders/OrderHistoryPage'
import OrderTrackingPage from '../pages/orders/OrderTrackingPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ProfilePage from '../pages/profile/ProfilePage'
import SellerDashboardPage from '../pages/seller/SellerDashboardPage'
import AdminGuard from '../admin/components/AdminGuard'
import AdminLayout from '../admin/layout/AdminLayout'
import AdminTrafficAnalyticsPage from '../admin/pages/AdminTrafficAnalyticsPage'
import AdminDashboardPage from '../admin/pages/AdminDashboardPage'
import AdminProductsPage from '../admin/pages/AdminProductsPage'
import AdminProductFormPage from '../admin/pages/AdminProductFormPage'
import AdminUsersPage from '../admin/pages/AdminUsersPage'
import AdminOrdersPage from '../admin/pages/AdminOrdersPage'
import { AdminCategoriesPage } from '../admin/pages/AdminCategoriesPage'
import StaffGuard from '../staff/components/StaffGuard'
import StaffLayout from '../staff/layout/StaffLayout'
import StaffOrdersPage from '../staff/pages/StaffOrdersPage'
import ShipperGuard from '../shipper/components/ShipperGuard'
import ShipperLayout from '../shipper/layout/ShipperLayout'
import ShipperOrdersPage from '../shipper/pages/ShipperOrdersPage'

export default function AppRoutes() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={PATHS.home} element={<HomePage />} />
        <Route path={PATHS.aiResult} element={<AiResultPage />} />
        <Route path={PATHS.legitResult} element={<LegitResultPage />} />
        <Route path={PATHS.women} element={<WomenCategoryPage />} />
        <Route path={PATHS.men} element={<MenCategoryPage />} />

        <Route path={PATHS.brands} element={<BrandsCategoryPage />} />
        <Route path={PATHS.sport} element={<SportCategoryPage />} />
        <Route path={PATHS.cart} element={<CartPage />} />
        <Route path={PATHS.vnpayReturn} element={<VnpayReturnPage />} />
        <Route path={PATHS.sepayCheckout} element={<SepayCheckoutPage />} />
        <Route path={PATHS.orders} element={<OrderHistoryPage />} />
        <Route path={PATHS.orderTracking} element={<OrderTrackingPage />} />
        <Route path={PATHS.contact} element={<ContactPage />} />
        <Route path={PATHS.about} element={<AboutPage />} />
        <Route path={PATHS.helpCenter} element={<HelpCenterPage />} />
        <Route path={PATHS.returnPolicy} element={<ReturnPolicyPage />} />
        <Route path={PATHS.reportBug} element={<ReportBugPage />} />
        <Route path={PATHS.productDetail} element={<ProductDetailPage />} />
        <Route path={PATHS.profile} element={<ProfilePage />} />
        <Route path={PATHS.sellerDashboard} element={<SellerDashboardPage />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path={PATHS.login} element={<LoginPage />} />
        <Route path={PATHS.register} element={<RegisterPage />} />
        <Route path={PATHS.forgotPassword} element={<ForgotPasswordPage />} />
      </Route>
      <Route
        path={PATHS.admin}
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path={PATHS.adminTraffic.replace('/admin/', '')} element={<AdminTrafficAnalyticsPage />} />
        <Route path={PATHS.adminProducts.replace('/admin/', '')} element={<AdminProductsPage />} />
        <Route path={PATHS.adminProductNew.replace('/admin/', '')} element={<AdminProductFormPage />} />
        <Route path={PATHS.adminProductEdit.replace('/admin/', '')} element={<AdminProductFormPage />} />
        <Route path={PATHS.adminCategories.replace('/admin/', '')} element={<AdminCategoriesPage />} />
        <Route path={PATHS.adminUsers.replace('/admin/', '')} element={<AdminUsersPage />} />
        <Route path={PATHS.adminOrders.replace('/admin/', '')} element={<AdminOrdersPage />} />
      </Route>
      <Route
        path={PATHS.staff}
        element={
          <StaffGuard>
            <StaffLayout />
          </StaffGuard>
        }
      >
        <Route index element={<StaffOrdersPage />} />
        <Route path={PATHS.staffOrders.replace('/staff/', '')} element={<StaffOrdersPage />} />
      </Route>
      {/* ── Shipper routes ── */}
      <Route
        path={PATHS.shipper}
        element={
          <ShipperGuard>
            <ShipperLayout />
          </ShipperGuard>
        }
      >
        <Route index element={<ShipperOrdersPage />} />
        <Route path={PATHS.shipperOrders.replace('/shipper/', '')} element={<ShipperOrdersPage />} />
      </Route>
    </Routes>
  )
}
