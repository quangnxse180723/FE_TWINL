import { NavLink } from 'react-router-dom'
import { PATHS } from '../../routes/paths'

const links = [{ to: PATHS.shipperOrders, label: 'Đơn của tôi', icon: '📦' }]

export default function ShipperSidebar({ isSidebarOpen = true }: { isSidebarOpen?: boolean }) {
  return (
    <aside className={`admin__sidebar ${isSidebarOpen ? '' : 'admin__sidebar--closed'}`}>
      <div className="admin__brand">
        <span className="admin__brand-title">Twinl Shipper</span>
        <span className="admin__brand-sub">Delivery Control</span>
      </div>
      <nav className="admin__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
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
