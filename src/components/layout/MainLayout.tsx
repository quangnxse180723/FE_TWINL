import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function MainLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  return (
    <div className="page-shell">
      <Header />
      <main className="flex-1" style={{ paddingTop: isHome ? '0' : '96px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
