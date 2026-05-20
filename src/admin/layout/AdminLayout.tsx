import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import '../../styles/pages/admin.css'

export default function AdminLayout() {
  return (
    <div className="admin">
      <AdminSidebar />
      <div className="admin__main">
        <AdminTopbar />
        <main className="admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
