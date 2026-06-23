import { NavLink } from 'react-router-dom'
import { PATHS } from '../../routes/paths'
import { LayoutDashboard, BarChart3, Package, Layers, Users, ShoppingCart } from 'lucide-react'

const links = [
  { to: PATHS.admin, label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
  { to: PATHS.adminTraffic, label: 'Thống kê Truy cập', icon: <BarChart3 size={20} /> },
  { to: PATHS.adminProducts, label: 'Sản phẩm', icon: <Package size={20} /> },
  { to: PATHS.adminCategories, label: 'Danh mục', icon: <Layers size={20} /> },
  { to: PATHS.adminUsers, label: 'Tài khoản', icon: <Users size={20} /> },
  { to: PATHS.adminOrders, label: 'Đơn hàng', icon: <ShoppingCart size={20} /> },
]

export default function AdminSidebar({ isSidebarOpen = true }: { isSidebarOpen?: boolean }) {
  return (
    <aside className={`admin__sidebar ${isSidebarOpen ? '' : 'admin__sidebar--closed'}`}>
      <div className="admin__brand">
        <span className="admin__brand-title">Twinl Admin</span>
        <span className="admin__brand-sub">Ecommerce Control</span>
      </div>
      <nav className="admin__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === PATHS.admin}
            className={({ isActive }) =>
              isActive ? 'admin__nav-link admin__nav-link--active' : 'admin__nav-link'
            }
          >
            <span className="admin__nav-icon">{link.icon}</span>
            <span className="admin__nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
