import { Outlet } from 'react-router-dom'
import StaffSidebar from './StaffSidebar'
import StaffTopbar from './StaffTopbar'
import '../../styles/pages/admin.css'

export default function StaffLayout() {
  return (
    <div className="admin">
      <StaffSidebar />
      <div className="admin__main">
        <StaffTopbar />
        <main className="admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
