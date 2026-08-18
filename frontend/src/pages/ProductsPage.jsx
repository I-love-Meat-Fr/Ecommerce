import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productApi } from '../services/api'
import { Filter, Grid, List, ChevronDown } from 'lucide-react'

const categories = [
  { id: 'all', name: 'Tất cả sản phẩm' },
  { id: 'cay-giong', name: 'Cây giống' },
  { id: 'hoa-dong-tien', name: 'Hoa đồng tiền' },
  { id: 'lan-y', name: 'Lan ý' },
  { id: 'monstera', name: 'Monstera' },
  { id: 'hot-deal', name: 'Hot Deal' },
]

// Sample products for demo
const sampleProducts = [
  { _id: '1', name: 'Hoa Đồng Tiền Vàng', slug: 'hoa-dong-tien-vang', description: 'Hoa đồng tiền vàng rực rỡ', imageUrl: 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=400', category: 'cay-giong', variants: [{ price: 250000, sku: 'HDT-VANG-01' }] },
  { _id: '2', name: 'Hoa Đồng Tiền Đỏ', slug: 'hoa-dong-tien-do', description: 'Hoa đồng tiền đỏ thắm', imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400', category: 'cay-giong', variants: [{ price: 280000, sku: 'HDT-DO-01' }] },
  { _id: '3', name: 'Lan Ý Trắng', slug: 'lan-y-trang', description: 'Lan ý trắng tinh khiết', imageUrl: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=400', category: 'lan-y', variants: [{ price: 350000, sku: 'LY-TRANG-01' }] },
  { _id: '4', name: 'Lan Ý Hồng', slug: 'lan-y-hong', description: 'Lan ý hồng đẹp mắt', imageUrl: 'https://images.unsplash.com/photo-1616961686680-8f76a5d0e8e8?w=400', category: 'lan-y', variants: [{ price: 380000, sku: 'LY-HONG-01' }] },
  { _id: '5', name: 'Monstera Deliciosa', slug: 'monstera-deliciosa', description: 'Cây Monstera lá xẻ', imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400', category: 'monstera', variants: [{ price: 450000, sku: 'MON-DEL-01' }] },
  { _id: '6', name: 'Monstera Obliqua', slug: 'monstera-obliqua', description: 'Monstera Obliqua hiếm', imageUrl: 'https://images.unsplash.com/photo-1637967886160-fd78dc3ce3f5?w=400', category: 'monstera', variants: [{ price: 850000, sku: 'MON-OBL-01' }] },
  { _id: '7', name: 'Alocasia Polly', slug: 'alocasia-polly', description: 'Alocasia Polly lá mũi tên', imageUrl: 'https://images.unsplash.com/photo-1620803366004-119b57f54cd6?w=400', category: 'cay-giong', variants: [{ price: 380000, sku: 'ALO-POL-01' }] },
  { _id: '8', name: 'Philodendron Gloriosum', slug: 'philodendron-gloriosum', description: 'Philodendron Gloriosum đẹp', imageUrl: 'https://images.unsplash.com/photo-1604762525953-f53a4b07962c?w=400', category: 'cay-giong', variants: [{ price: 520000, sku: 'PHI-GLO-01' }] },
]

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState(sampleProducts)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const categoryParam = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('search') || ''

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        let data
        if (categoryParam && categoryParam !== 'all') {
          data = await productApi.getByCategory(categoryParam)
        } else {
          data = await productApi.getAll()
        }
        if (data && data.length > 0) {
          setProducts(data)
        }
      } catch (error) {
        // Keep sample products
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [categoryParam])

  const handleCategoryChange = (categoryId) => {
    if (categoryId === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', categoryId)
    }
    setSearchParams(searchParams)
  }

  const filteredProducts = products.filter(product => {
    if (searchQuery) {
      return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Breadcrumb */}
      <div className="container-custom">
        <nav className="text-sm mb-6">
          <ol className="flex items-center gap-2 text-gray-600">
            <li><a href="/" className="hover:text-primary-600">Trang chủ</a></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Sản phẩm</li>
          </ol>
        </nav>
      </div>

      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Danh mục
                </h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          categoryParam === cat.id || (cat.id === 'all' && !searchParams.get('category'))
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price filter placeholder */}
              <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
                <h3 className="font-semibold text-lg mb-4">Khoảng giá</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-primary-600" />
                    <span>Dưới 200.000đ</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-primary-600" />
                    <span>200.000đ - 500.000đ</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-primary-600" />
                    <span>Trên 500.000đ</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {categories.find(c => c.id === categoryParam)?.name || 'Tất cả sản phẩm'}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  {filteredProducts.length} sản phẩm
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </button>

                {/* Sort dropdown */}
                <div className="relative">
                  <select className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>Mới nhất</option>
                    <option>Giá thấp đến cao</option>
                    <option>Giá cao đến thấp</option>
                    <option>Tên A-Z</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
                </div>

                {/* View mode */}
                <div className="hidden sm:flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-50'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-50'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600 mb-4">Hãy thử tìm kiếm với từ khóa khác</p>
                <a href="/san-pham" className="btn-primary inline-block">
                  Xem tất cả sản phẩm
                </a>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
