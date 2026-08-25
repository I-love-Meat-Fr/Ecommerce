import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import BlogPage from './pages/BlogPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AccountPage from './pages/AccountPage'
import AdminPage from './pages/AdminPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import CheckoutPage from './pages/CheckoutPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin routes — use their own layout (no storefront header/footer/floatings) */}
      <Route
        path="admin"
        element={
          <ProtectedRoute requireRole="Admin">
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/products"
        element={
          <ProtectedRoute requireRole="Admin">
            <AdminProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/users"
        element={
          <ProtectedRoute requireRole="Admin">
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/orders"
        element={
          <ProtectedRoute requireRole="Admin">
            <AdminOrdersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
