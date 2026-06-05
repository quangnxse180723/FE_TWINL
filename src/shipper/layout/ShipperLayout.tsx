import { Outlet } from 'react-router-dom'
import ShipperSidebar from './ShipperSidebar'
import ShipperTopbar from './ShipperTopbar'
import '../../styles/pages/admin.css'

export default function ShipperLayout() {
  return (
    <div className="admin">
      <ShipperSidebar />
      <div className="admin__main">
        <ShipperTopbar />
        <main className="admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
