import { NavLink } from 'react-router-dom'
import { PATHS } from '../../routes/paths'

const links = [
  { to: PATHS.staffOrders, label: 'Đơn hàng', icon: '▤' },
]

export default function StaffSidebar() {
  return (
    <aside className="admin__sidebar">
      <div className="admin__brand">
        <span className="admin__brand-title">Twinl Staff</span>
        <span className="admin__brand-sub">Order Control</span>
      </div>
      <nav className="admin__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === PATHS.staff}
            className={({ isActive }) =>
              isActive ? 'admin__nav-link admin__nav-link--active' : 'admin__nav-link'
            }
          >
            <span className="admin__nav-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
