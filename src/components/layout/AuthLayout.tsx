import { Outlet } from 'react-router-dom'
import Footer from './Footer'

export default function AuthLayout() {
  return (
    <div className="page-shell">
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
