import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ShipperSidebar from './ShipperSidebar'
import ShipperTopbar from './ShipperTopbar'
import '../../styles/pages/admin.css'

export default function ShipperLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className={`admin ${isSidebarOpen ? '' : 'admin--sidebar-closed'}`}>
      <ShipperSidebar isSidebarOpen={isSidebarOpen} />
      <div className="admin__main">
        <ShipperTopbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
