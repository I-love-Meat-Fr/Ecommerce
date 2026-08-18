import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productApi } from '../services/api'
import { ChevronRight, Leaf, Truck, Shield, Headphones } from 'lucide-react'

// Sample featured products (will be replaced with API data)
const sampleProducts = [
  {
    _id: '1',
    name: 'Hoa Đồng Tiền Vàng',
    slug: 'hoa-dong-tien-vang',
    description: 'Hoa đồng tiền vàng rực rỡ, dễ trồng, thích hợp cho ban công và vườn',
    imageUrl: 'https://florist.vn/wp-content/uploads/2020/10/hoa-dong-tien.jpg',
    category: 'cay-giong',
    variants: [{ price: 250000, sku: 'HDT-VANG-01' }],
  },
  {
    _id: '2',
    name: 'Lan Ý Trắng',
    slug: 'lan-y-trang',
    description: 'Lan ý trắng tinh khiết, lọc không khí tốt, phù hợp văn phòng',
    imageUrl: 'https://florist.vn/wp-content/uploads/2020/10/lan-y.jpg',
    category: 'cay-giong',
    variants: [{ price: 350000, sku: 'LY-TRANG-01' }],
  },
  {
    _id: '3',
    name: 'Monstera Deliciosa',
    slug: 'monstera-deliciosa',
    description: 'Cây Monstera xanh tốt, lá to bản, mang phong cách nhiệt đới',
    imageUrl: 'https://florist.vn/wp-content/uploads/2020/10/monstera.jpg',
    category: 'cay-giong',
    variants: [{ price: 450000, sku: 'MON-DEL-01' }],
  },
  {
    _id: '4',
    name: 'Alocasia Polly',
    slug: 'alocasia-polly',
    description: 'Alocasia Polly với lá xanh đậm hình mũi tên độc đáo',
    imageUrl: 'https://florist.vn/wp-content/uploads/2020/10/alocasia.jpg',
    category: 'cay-giong',
    variants: [{ price: 380000, sku: 'ALO-POL-01' }],
  },
]

const features = [
  {
    icon: Leaf,
    title: 'Cây giống chất lượng',
    description: '100% cây giống được kiểm định, đảm bảo sức sống',
  },
  {
    icon: Truck,
    title: 'Giao hàng nhanh',
    description: 'Giao hàng toàn quốc trong 24-48h',
  },
  {
    icon: Shield,
    title: 'Bảo hành 30 ngày',
    description: 'Đổi trả miễn phí nếu cây không sống',
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ 24/7',
    description: 'Tư vấn chăm sóc cây miễn phí',
  },
]

function HomePage() {
  const [products, setProducts] = useState(sampleProducts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to fetch from API
    const fetchProducts = async () => {
      try {
        const data = await productApi.getAll()
        if (data && data.length > 0) {
          setProducts(data.slice(0, 8))
        }
      } catch (error) {
        console.log('Using sample products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
        </div>
        
        <div className="container-custom relative py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                🌱 Chuyên cây giống hoa đồng tiền
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Khám phá thế giới 
                <span className="block text-yellow-300">Cây cảnh xanh</span>
              </h1>
              <p className="text-lg text-white/90 max-w-lg">
                Florist Vietnam - Địa chỉ tin cậy cho những người yêu cây cảnh. 
                Hơn 1000+ sản phẩm cây giống chất lượng cao.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/san-pham" className="btn-primary bg-white text-primary-700 hover:bg-gray-100">
                  Xem sản phẩm
                  <ChevronRight className="inline w-5 h-5 ml-1" />
                </Link>
                <Link to="/lien-he" className="btn-secondary border-white text-white hover:bg-white/10">
                  Liên hệ ngay
                </Link>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=600&fit=crop"
                alt="Cây cảnh xanh"
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Danh mục sản phẩm</h2>
            <p className="section-subtitle">
              Khám phá các loại cây cảnh đa dạng tại Florist Vietnam
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Hoa Đồng Tiền', slug: 'cay-giong', image: 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=400&h=400&fit=crop' },
              { name: 'Lan Ý', slug: 'lan-y', image: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=400&h=400&fit=crop' },
              { name: 'Monstera', slug: 'monstera', image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=400&fit=crop' },
              { name: 'Quà Tặng', slug: 'qua-tang', image: 'https://images.unsplash.com/photo-1510525009512-ad7fc60f4a2e?w=400&h=400&fit=crop' },
            ].map((category) => (
              <Link
                key={category.slug}
                to={`/san-pham?category=${category.slug}`}
                className="group relative aspect-square rounded-2xl overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold">{category.name}</h3>
                  <span className="text-white/80 text-sm">Xem ngay →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="section-title text-left mb-2">Sản phẩm nổi bật</h2>
              <p className="section-subtitle text-left">
                Những sản phẩm được yêu thích nhất
              </p>
            </div>
            <Link 
              to="/san-pham" 
              className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
            >
              Xem tất cả sản phẩm
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=500&fit=crop"
                alt="Vườn cây Florist"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white p-6 rounded-xl shadow-xl">
                <div className="text-4xl font-bold">10+</div>
                <div className="text-sm">Năm kinh nghiệm</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <span className="text-primary-600 font-semibold">Về chúng tôi</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Florist Vietnam - Điểm đến tin cậy cho cây cảnh
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Florist Vietnam là doanh nghiệp hoạt động trong lĩnh vực nông nghiệp công nghệ cao, 
                chuyên về HOA & CÂY GIỐNG có giá trị kinh tế cao. Với trách nhiệm nghiên cứu, 
                lai tạo và trồng thử nghiệm các giống hoa mới, có giá trị kinh tế, 
                phù hợp với điều kiện tự nhiên của Miền Bắc Việt Nam.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '1000+', label: 'Khách hàng' },
                  { value: '50+', label: 'Loại cây' },
                  { value: '100%', label: 'Chất lượng' },
                  { value: '24h', label: 'Giao hàng' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-primary-600">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
              <Link to="/gioi-thieu" className="btn-primary inline-block">
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bạn cần tư vấn về cây cảnh?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Đội ngũ chuyên gia của Florist Vietnam luôn sẵn sàng hỗ trợ bạn 
            trong việc chọn lựa và chăm sóc cây cảnh.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:0818596696" className="btn-primary bg-white text-primary-700 hover:bg-gray-100">
              📞 Gọi ngay: 0818 596 696
            </a>
            <Link to="/lien-he" className="btn-secondary border-white text-white hover:bg-white/10">
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
