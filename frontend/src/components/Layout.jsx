import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import MobileMenu from './MobileMenu'
import { useState, useEffect } from 'react'
import { Phone, ArrowUp } from 'lucide-react'

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-ivory-50 font-sans">
      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* Floating contact buttons */}
      <div className="fixed right-5 bottom-24 flex flex-col gap-2 z-40">
        <a 
          href="tel:0818596696" 
          className="w-12 h-12 bg-ink-900 text-ivory-50 flex items-center justify-center shadow-elevated hover:bg-champagne-500 transition-all duration-300"
          title="Gọi điện"
        >
          <Phone className="w-4 h-4" strokeWidth={1.5} />
        </a>
        <a 
          href="https://zalo.me/0818596696" 
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-ivory-50 text-ink-900 border border-ink-900/10 flex items-center justify-center shadow-elevated hover:bg-ink-900 hover:text-ivory-50 transition-all duration-300"
          title="Zalo"
        >
          <span className="font-display text-base">Z</span>
        </a>
      </div>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed right-5 bottom-5 w-12 h-12 bg-champagne-400 text-ink-900 flex items-center justify-center shadow-elevated hover:bg-champagne-500 transition-all duration-300 z-40 ${
          showBackToTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        title="Lên đầu trang"
      >
        <ArrowUp className="w-4 h-4" strokeWidth={1.5} />
      </button>
    </div>
  )
}

export default Layout