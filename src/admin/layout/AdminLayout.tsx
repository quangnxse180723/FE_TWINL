import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import '../../styles/pages/admin.css'

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className={`admin ${isSidebarOpen ? '' : 'admin--sidebar-closed'}`}>
      <AdminSidebar isSidebarOpen={isSidebarOpen} />
      <div className="admin__main">
        <AdminTopbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
