import { Route, Routes } from 'react-router-dom'
import { PATHS } from './paths'
import MainLayout from '../components/layout/MainLayout'
import AuthLayout from '../components/layout/AuthLayout'
import HomePage from '../pages/home/HomePage'
import WomenCategoryPage from '../pages/category/WomenCategoryPage'
import MenCategoryPage from '../pages/category/MenCategoryPage'
import KidsCategoryPage from '../pages/category/KidsCategoryPage'
import BrandsCategoryPage from '../pages/category/BrandsCategoryPage'
import SportCategoryPage from '../pages/category/SportCategoryPage'
import ProductDetailPage from '../pages/products/ProductDetailPage'
import CartPage from '../pages/cart/CartPage'
import ContactPage from '../pages/contact/ContactPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ProfilePage from '../pages/profile/ProfilePage'
import AdminGuard from '../admin/components/AdminGuard'
import AdminLayout from '../admin/layout/AdminLayout'
import AdminDashboardPage from '../admin/pages/AdminDashboardPage'
import AdminProductsPage from '../admin/pages/AdminProductsPage'
import AdminProductFormPage from '../admin/pages/AdminProductFormPage'
import AdminUsersPage from '../admin/pages/AdminUsersPage'
import AdminOrdersPage from '../admin/pages/AdminOrdersPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={PATHS.home} element={<HomePage />} />
        <Route path={PATHS.women} element={<WomenCategoryPage />} />
        <Route path={PATHS.men} element={<MenCategoryPage />} />
        <Route path={PATHS.kids} element={<KidsCategoryPage />} />
        <Route path={PATHS.brands} element={<BrandsCategoryPage />} />
        <Route path={PATHS.sport} element={<SportCategoryPage />} />
        <Route path={PATHS.cart} element={<CartPage />} />
        <Route path={PATHS.contact} element={<ContactPage />} />
        <Route path={PATHS.productDetail} element={<ProductDetailPage />} />
        <Route path={PATHS.profile} element={<ProfilePage />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path={PATHS.login} element={<LoginPage />} />
        <Route path={PATHS.register} element={<RegisterPage />} />
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
        <Route path={PATHS.adminProducts.replace('/admin/', '')} element={<AdminProductsPage />} />
        <Route path={PATHS.adminProductNew.replace('/admin/', '')} element={<AdminProductFormPage />} />
        <Route path={PATHS.adminProductEdit.replace('/admin/', '')} element={<AdminProductFormPage />} />
        <Route path={PATHS.adminUsers.replace('/admin/', '')} element={<AdminUsersPage />} />
        <Route path={PATHS.adminOrders.replace('/admin/', '')} element={<AdminOrdersPage />} />
      </Route>
    </Routes>
  )
}
