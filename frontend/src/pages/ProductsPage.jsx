import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productApi } from '../services/api'
import { Filter, ChevronDown, ArrowUpDown, X } from 'lucide-react'

const categories = [
  { id: 'all', name: 'Tất Cả', subtitle: 'Toàn bộ' },
  { id: 'cay-giong', name: 'Cây Giống', subtitle: 'Giống hoa' },
  { id: 'hoa-dong-tien', name: 'Hoa Đồng Tiền', subtitle: 'Đặc biệt' },
  { id: 'lan-y', name: 'Lan Ý', subtitle: 'Thanh lọc' },
  { id: 'monstera', name: 'Monstera', subtitle: 'Nhiệt đới' },
  { id: 'hot-deal', name: 'Hot Deal', subtitle: 'Ưu đãi' },
]

const sampleProducts = [
  { _id: '1', name: 'Hoa Đồng Tiền Vàng', slug: 'hoa-dong-tien-vang', description: 'Hoa đồng tiền vàng rực rỡ', imageUrl: 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=600', category: 'cay-giong', variants: [{ price: 250000, sku: 'HDT-VANG-01' }] },
  { _id: '2', name: 'Hoa Đồng Tiền Đỏ', slug: 'hoa-dong-tien-do', description: 'Hoa đồng tiền đỏ thắm', imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600', category: 'cay-giong', variants: [{ price: 280000, sku: 'HDT-DO-01' }] },
  { _id: '3', name: 'Lan Ý Trắng', slug: 'lan-y-trang', description: 'Lan ý trắng tinh khiết', imageUrl: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=600', category: 'lan-y', variants: [{ price: 350000, sku: 'LY-TRANG-01' }] },
  { _id: '4', name: 'Lan Ý Hồng', slug: 'lan-y-hong', description: 'Lan ý hồng đẹp mắt', imageUrl: 'https://images.unsplash.com/photo-1616961686680-8f76a5d0e8e8?w=600', category: 'lan-y', variants: [{ price: 380000, sku: 'LY-HONG-01' }] },
  { _id: '5', name: 'Monstera Deliciosa', slug: 'monstera-deliciosa', description: 'Cây Monstera lá xẻ', imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600', category: 'monstera', variants: [{ price: 450000, sku: 'MON-DEL-01' }] },
  { _id: '6', name: 'Monstera Obliqua', slug: 'monstera-obliqua', description: 'Monstera Obliqua hiếm', imageUrl: 'https://images.unsplash.com/photo-1637967886160-fd78dc3ce3f5?w=600', category: 'monstera', variants: [{ price: 850000, sku: 'MON-OBL-01' }] },
  { _id: '7', name: 'Alocasia Polly', slug: 'alocasia-polly', description: 'Alocasia Polly lá mũi tên', imageUrl: 'https://images.unsplash.com/photo-1620803366004-119b57f54cd6?w=600', category: 'cay-giong', variants: [{ price: 380000, sku: 'ALO-POL-01' }] },
  { _id: '8', name: 'Philodendron Gloriosum', slug: 'philodendron-gloriosum', description: 'Philodendron Gloriosum đẹp', imageUrl: 'https://images.unsplash.com/photo-1604762525953-f53a4b07962c?w=600', category: 'cay-giong', variants: [{ price: 520000, sku: 'PHI-GLO-01' }] },
]

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState(sampleProducts)
  const [loading, setLoading] = useState(true)
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
    setShowFilters(false)
  }

  const filteredProducts = products.filter(product => {
    if (searchQuery) {
      return product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const currentCategory = categories.find(c => c.id === categoryParam)

  return (
    <div className="bg-ivory-50 min-h-screen">
      {/* ========== EDITORIAL HEADER ========== */}
      <section className="pt-12 md:pt-20 pb-12 md:pb-16">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-[11px] tracking-widest uppercase mb-10">
            <Link to="/" className="text-ink-500 hover:text-ink-900 transition-colors">Trang Chủ</Link>
            <span className="text-ink-300">/</span>
            <span className="text-ink-900 font-medium">Bộ Sưu Tập</span>
          </nav>

          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <p className="section-number mb-4">— Bộ Sưu Tập / {currentCategory?.subtitle || 'Toàn Bộ'}</p>
              <h1 className="font-display text-display-lg text-ink-900">
                {currentCategory?.name || 'Toàn Bộ'}<br/>
                <em className="italic text-champagne-500">sản phẩm</em>
              </h1>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-ink-500 leading-relaxed font-light text-sm">
                Khám phá bộ sưu tập cây giống và cây cảnh được tuyển chọn, 
                mang đến vẻ đẹp tinh tế cho không gian sống của bạn.
              </p>
              <p className="text-[10px] tracking-widest uppercase text-champagne-500 font-semibold mt-4">
                Hiển thị {filteredProducts.length} sản phẩm
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom"><div className="divider-thin" /></div>

      {/* ========== FILTERS BAR ========== */}
      <section className="sticky top-[100px] z-30 bg-ivory-50/95 backdrop-blur-md py-5 border-b border-ivory-300">
        <div className="container-custom">
          <div className="flex items-center justify-between gap-6">
            {/* Desktop categories */}
            <div className="hidden lg:flex items-center gap-8 flex-1 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`group whitespace-nowrap text-sm tracking-wide transition-colors pb-1 border-b-2 ${
                    categoryParam === cat.id || (cat.id === 'all' && !searchParams.get('category'))
                      ? 'text-ink-900 border-champagne-500 font-medium'
                      : 'text-ink-500 border-transparent hover:text-ink-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 text-sm tracking-widest uppercase"
            >
              <Filter className="w-4 h-4" strokeWidth={1.5} />
              Danh Mục
            </button>

            {/* Sort */}
            <div className="relative flex items-center gap-3 ml-auto">
              <ArrowUpDown className="w-3 h-3 text-ink-400 hidden sm:block" strokeWidth={1.5} />
              <select className="appearance-none bg-transparent text-sm tracking-wide pr-6 cursor-pointer focus:outline-none text-ink-700">
                <option>Mới nhất</option>
                <option>Giá thấp đến cao</option>
                <option>Giá cao đến thấy</option>
                <option>Tên A-Z</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-400 pointer-events-none" />
            </div>
          </div>

          {/* Mobile categories */}
          {showFilters && (
            <div className="lg:hidden mt-5 pt-5 border-t border-ivory-300 flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 text-xs tracking-wide border ${
                    categoryParam === cat.id || (cat.id === 'all' && !searchParams.get('category'))
                      ? 'bg-ink-900 text-ivory-50 border-ink-900'
                      : 'border-ivory-300 text-ink-600 hover:border-ink-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== PRODUCT GRID ========== */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-14">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-[4/5] shimmer mb-5" />
                  <div className="h-5 shimmer w-2/3 mb-3" />
                  <div className="h-3 shimmer w-full mb-2" />
                  <div className="h-4 shimmer w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-14">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 max-w-md mx-auto">
              <X className="w-12 h-12 text-ivory-300 mx-auto mb-6" strokeWidth={1} />
              <h3 className="font-display text-2xl text-ink-900 mb-3">Không tìm thấy sản phẩm</h3>
              <p className="text-ink-500 font-light mb-8">Hãy thử tìm kiếm với từ khóa khác hoặc khám phá bộ sưu tập đầy đủ của chúng tôi.</p>
              <Link to="/products" className="btn-luxury-outline">
                Xem Toàn Bộ Sản Phẩm
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default ProductsPage