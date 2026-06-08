import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import StaffSidebar from './StaffSidebar'
import StaffTopbar from './StaffTopbar'
import '../../styles/pages/admin.css'

export default function StaffLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className={`admin ${isSidebarOpen ? '' : 'admin--sidebar-closed'}`}>
      <StaffSidebar isSidebarOpen={isSidebarOpen} />
      <div className="admin__main">
        <StaffTopbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
