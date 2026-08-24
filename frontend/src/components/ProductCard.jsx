import { Link } from 'react-router-dom'
import { ArrowRight, Heart } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import SafeImage from './SafeImage'

function ProductCard({ product, index = 0 }) {
  const addItem = useCartStore(state => state.addItem)
  
  const firstVariant = product.variants?.[0]
  const price = firstVariant?.price 
    ? new Intl.NumberFormat('vi-VN').format(firstVariant.price) + ' ₫'
    : 'Liên hệ'

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (firstVariant) {
      addItem(product, firstVariant)
    }
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory-100 mb-5">
        <div className="hover-zoom w-full h-full">
          <SafeImage
            src={product.imageUrl}
            alt={product.name}
            fallbackSeed={product.id || product.name}
            imgClassName="w-full h-full object-cover"
          />
        </div>
        
        {/* Wishlist */}
        <button 
          className="absolute top-4 right-4 w-9 h-9 bg-ivory-50/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-ink-900 hover:text-ivory-50"
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          aria-label="Yêu thích"
        >
          <Heart className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Category badge */}
        {product.category && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-ivory-50/95 backdrop-blur-sm text-ink-900 text-[10px] tracking-widest uppercase font-medium">
            {product.category}
          </span>
        )}

        {/* Quick shop overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out-expo">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-ink-900 text-ivory-50 text-[11px] tracking-editorial uppercase font-medium hover:bg-champagne-500 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            Thêm vào giỏ
            <ArrowRight className="w-3 h-3" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display text-lg md:text-xl text-ink-900 leading-snug group-hover:text-champagne-500 transition-colors duration-500">
            {product.name}
          </h3>
        </div>
        
        {product.description && (
          <p className="text-xs text-ink-500 mb-3 line-clamp-2 font-light leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="font-display text-base text-ink-900">
            {price}
          </span>
          <span className="text-[10px] tracking-widest uppercase text-ink-400 font-medium">
            № {String(index + 1).padStart(3, '0')}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard