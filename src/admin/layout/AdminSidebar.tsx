import { NavLink } from 'react-router-dom'
import { PATHS } from '../../routes/paths'

const links = [
  { to: PATHS.admin, label: 'Dashboard', icon: '⧉' },
  { to: PATHS.adminProducts, label: 'Sản phẩm', icon: '▢' },
  { to: PATHS.adminUsers, label: 'Tài khoản', icon: '◉' },
  { to: PATHS.adminOrders, label: 'Đơn hàng', icon: '▤' },
]

export default function AdminSidebar() {
  return (
    <aside className="admin__sidebar">
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
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button type="button" className="admin__cta">+ Add Product</button>
    </aside>
  )
}
