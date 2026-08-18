import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productApi } from '../services/api'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/ProductCard'
import { Minus, Plus, ShoppingCart, Heart, Share2, Check } from 'lucide-react'

// Sample product for demo
const sampleProduct = {
  _id: '1',
  name: 'Hoa Đồng Tiền Vàng Premium',
  slug: 'hoa-dong-tien-vang',
  description: 'Hoa đồng tiền vàng rực rỡ, dễ trồng và chăm sóc. Thích hợp cho ban công, sân vườn hoặc trang trí văn phòng. Cây có sức sống mạnh, ra hoa quanh năm.',
  category: 'cay-giong',
  imageUrl: 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=800',
  variants: [
    { sku: 'HDT-VANG-S', name: 'Nhỏ (15-20cm)', price: 150000, stock: 50 },
    { sku: 'HDT-VANG-M', name: 'Vừa (25-30cm)', price: 250000, stock: 30 },
    { sku: 'HDT-VANG-L', name: 'Lớn (35-40cm)', price: 380000, stock: 15 },
  ],
}

const relatedProducts = [
  { _id: '2', name: 'Hoa Đồng Tiền Đỏ', slug: 'hoa-dong-tien-do', imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400', variants: [{ price: 280000, sku: 'HDT-DO-01' }] },
  { _id: '3', name: 'Hoa Đồng Tiền Cam', slug: 'hoa-dong-tien-cam', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400', variants: [{ price: 260000, sku: 'HDT-CAM-01' }] },
  { _id: '4', name: 'Lan Ý Trắng', slug: 'lan-y-trang', imageUrl: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=400', variants: [{ price: 350000, sku: 'LY-TRANG-01' }] },
  { _id: '5', name: 'Monstera Deliciosa', slug: 'monstera-deliciosa', imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400', variants: [{ price: 450000, sku: 'MON-DEL-01' }] },
]

function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(sampleProduct)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  
  const addItem = useCartStore(state => state.addItem)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const data = await productApi.getById(slug)
        if (data) {
          setProduct(data)
        }
      } catch (error) {
        // Keep sample product
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  useEffect(() => {
    if (product.variants?.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[1] || product.variants[0])
    }
  }, [product, selectedVariant])

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Đã copy link sản phẩm!')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center gap-2 text-gray-600">
            <li><Link to="/" className="hover:text-primary-600">Trang chủ</Link></li>
            <li>/</li>
            <li><Link to="/san-pham" className="hover:text-primary-600">Sản phẩm</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Product Detail */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Image */}
            <div className="relative">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-xl"
              />
              <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                  {product.category || 'Cây giống'}
                </span>
                <span className="text-gray-500 text-sm">
                  SKU: {selectedVariant?.sku || 'N/A'}
                </span>
              </div>

              {/* Price */}
              {selectedVariant && (
                <div className="text-3xl font-bold text-primary-600 mb-6">
                  {formatPrice(selectedVariant.price)}
                </div>
              )}

              {/* Description */}
              <div className="prose prose-sm mb-6 text-gray-600">
                <p>{product.description}</p>
              </div>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Chọn kích thước:</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.sku}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 border-2 rounded-lg transition-all ${
                          selectedVariant?.sku === variant.sku
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="font-medium">{variant.name}</div>
                        <div className="text-sm text-gray-500">{formatPrice(variant.price)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Số lượng:</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-x py-2 focus:outline-none"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-100"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {selectedVariant && (
                    <span className="text-gray-600">
                      {selectedVariant.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm` : 'Hết hàng'}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                    addedToCart
                      ? 'bg-green-600 text-white'
                      : selectedVariant?.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Đã thêm vào giỏ!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Thêm vào giỏ hàng
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="p-4 border rounded-xl hover:bg-gray-50"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProductDetailPage
