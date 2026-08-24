import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import SafeImage from '../components/SafeImage'
import { productApi } from '../services/api'
import { ArrowRight, ArrowUpRight, Award, Truck, Leaf, ShieldCheck, Sparkles, Quote } from 'lucide-react'

const promises = [
  { icon: Leaf, title: 'Nguồn Gốc Rõ Ràng', desc: '100% cây giống được kiểm định chất lượng, truy xuất nguồn gốc minh bạch.' },
  { icon: Truck, title: 'Vận Chuyển An Toàn', desc: 'Giao hàng toàn quốc trong 24-48h với bao bì chuyên dụng.' },
  { icon: ShieldCheck, title: 'Bảo Hành Sức Sống', desc: 'Cam kết đổi trả miễn phí trong 30 ngày nếu cây không sống.' },
  { icon: Award, title: 'Tư Vấn Chuyên Gia', desc: 'Đội ngũ chuyên gia nông nghiệp đồng hành 24/7.' },
]

const editorial = [
  { num: '01', title: 'Nghệ Thuật', desc: 'Cây không chỉ trang trí — chúng kể câu chuyện về không gian sống của bạn.' },
  { num: '02', title: 'Bền Vững', desc: 'Cam kết phát triển nông nghiệp xanh, bảo vệ đa dạng sinh học.' },
  { num: '03', title: 'Tinh Tế', desc: 'Mỗi chiếc lá, mỗi cành hoa đều được tuyển chọn kỹ lưỡng.' },
]

function HomePage() {
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchProducts = async () => {
      setLoading(true)
      setLoadError(false)
      try {
        const data = await productApi.getAll()
        if (cancelled) return
        setAllProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        if (cancelled) return
        setLoadError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProducts()
    return () => {
      cancelled = true
    }
  }, [])

  // Pick the 4 products with the highest total stock across their variants.
  // Falls back to the first 4 when there's no stock data.
  const featuredProducts = useMemo(() => {
    if (!allProducts.length) return []
    const totalStock = (p) =>
      (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0)
    const withStock = allProducts.filter((p) => totalStock(p) > 0)
    const pool = withStock.length >= 4 ? withStock : allProducts
    return [...pool].sort((a, b) => totalStock(b) - totalStock(a)).slice(0, 4)
  }, [allProducts])

  // Derive categories from real product data. Each category becomes a tile
  // with a thumbnail (first product's image), a real product count, and the
  // raw category slug for the /products?category=… filter link.
  const categoryTiles = useMemo(() => {
    const map = new Map()
    for (const p of allProducts) {
      const slug = (p.category || '').trim()
      if (!slug) continue
      if (!map.has(slug)) {
        map.set(slug, { slug, name: slug, count: 0, imageUrl: p.imageUrl })
      }
      map.get(slug).count += 1
    }
    return [...map.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }, [allProducts])

  return (
    <div className="bg-ivory-50">
      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden">
        <div className="container-custom py-12 md:py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left - copy */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="section-number">— № 01 / Bộ Sưu Tập 2024</span>
                </div>
                
                <h1 className="font-display text-display-xl text-ink-900">
                  Nghệ thuật
                  <br/>
                  <em className="italic text-champagne-500">chăm sóc</em>
                  <br/>
                  cây cảnh
                </h1>
                
                <p className="text-ink-600 text-base md:text-lg leading-relaxed max-w-md font-light">
                  Khám phá bộ sưu tập cây giống hoa & cây cảnh được tuyển chọn — 
                  nơi thiên nhiên trở thành biểu tượng của phong cách sống hiện đại.
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <Link to="/products" className="btn-luxury-gold">
                    Khám Phá Ngay
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </Link>
                  <Link to="/about" className="link-editorial">
                    Câu Chuyện
                    <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                  </Link>
                </div>

                {/* Stats inline */}
                <div className="grid grid-cols-3 gap-8 pt-12 border-t border-ivory-300">
                  <div>
                    <div className="font-display text-3xl text-ink-900">10+</div>
                    <p className="text-[10px] tracking-widest uppercase text-ink-500 mt-1">Năm Kinh Nghiệm</p>
                  </div>
                  <div>
                    <div className="font-display text-3xl text-ink-900">2K+</div>
                    <p className="text-[10px] tracking-widest uppercase text-ink-500 mt-1">Khách Hàng</p>
                  </div>
                  <div>
                    <div className="font-display text-3xl text-ink-900">50+</div>
                    <p className="text-[10px] tracking-widest uppercase text-ink-500 mt-1">Giống Cây</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - image composition */}
            <div className="lg:col-span-7 order-1 lg:order-2 relative">
              <div className="grid grid-cols-12 gap-4 md:gap-6">
                {/* Main image */}
                <div className="col-span-12 hover-zoom aspect-[4/5] md:aspect-[5/6] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=900&h=1100&fit=crop"
                    alt="Cây cảnh nghệ thuật"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating elements */}
                <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 bg-ivory-50 p-6 md:p-8 max-w-[260px] shadow-elevated">
                  <Sparkles className="w-5 h-5 text-champagne-500 mb-3" strokeWidth={1.5} />
                  <p className="font-display text-lg leading-snug">
                    <em>Tuyển chọn</em> thủ công bởi nghệ nhân làm vườn.
                  </p>
                </div>
              </div>
              
              {/* Side small image */}
              <div className="hidden md:block absolute top-8 -right-6 w-40 h-52 lg:w-48 lg:h-64 hover-zoom overflow-hidden shadow-elevated">
                <img
                  src="https://i.pinimg.com/736x/24/48/24/2448247c4cb0731f776a84dd6c263cfe.jpg"
                  alt="Chi tiết"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom"><div className="divider-thin" /></div>

      {/* ========== PROMISES ========== */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="grid md:grid-cols-12 gap-10 mb-16 md:mb-20">
            <div className="md:col-span-4">
              <p className="section-number mb-3">— № 02 / Cam Kết</p>
              <h2 className="font-display text-display-lg text-ink-900">
                Triết lý <em className="italic text-champagne-500">của chúng tôi</em>
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <p className="text-ink-600 text-lg leading-relaxed font-light">
                Florist Vietnam không đơn thuần là nơi bán cây — chúng tôi kiến tạo 
                những không gian sống xanh, nơi mỗi chiếc lá đều mang một câu chuyện 
                về sự tinh tế và tận tâm.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-ivory-300">
            {promises.map((item, i) => (
              <div key={i} className="bg-ivory-50 p-8 md:p-10 group hover:bg-ivory-100 transition-colors duration-500">
                <div className="flex items-start justify-between mb-8">
                  <item.icon className="w-7 h-7 text-ink-900 group-hover:text-champagne-500 transition-colors" strokeWidth={1.25} />
                  <span className="section-number">№ {String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="font-display text-xl text-ink-900 mb-3 leading-snug">{item.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES (Editorial B/W Grid) ========== */}
      {categoryTiles.length > 0 && (
      <section className="py-20 md:py-28 bg-ivory-100">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <p className="section-number mb-3">— № 03 / Danh Mục</p>
              <h2 className="font-display text-display-lg text-ink-900">
                Bộ sưu tập <em className="italic">nổi bật</em>
              </h2>
            </div>
            <Link to="/products" className="link-editorial self-start md:self-end">
              Tất Cả Danh Mục
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {categoryTiles.map((cat, i) => (
              <Link
                key={cat.slug}
                to={`/products?category=${encodeURIComponent(cat.slug)}`}
                className="group relative aspect-[3/4] overflow-hidden bg-ink-900"
              >
                <div className="hover-zoom absolute inset-0">
                  <SafeImage
                    src={cat.imageUrl}
                    alt={cat.name}
                    fallbackSeed={cat.slug}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover opacity-90 group-hover:opacity-70 transition-opacity duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent" />

                {/* Index number */}
                <span className="absolute top-5 left-5 text-[10px] tracking-widest uppercase text-ivory-50/70 font-medium">
                  — {String(i + 1).padStart(2, '0')}
                </span>

                {/* Arrow */}
                <div className="absolute top-5 right-5 w-10 h-10 border border-ivory-50/40 rounded-full flex items-center justify-center text-ivory-50 group-hover:bg-ivory-50 group-hover:text-ink-900 group-hover:rotate-45 transition-all duration-500">
                  <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                  <h3 className="font-display text-xl md:text-2xl text-ivory-50 leading-tight mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] tracking-widest uppercase text-ivory-50/70 font-medium">
                    {cat.count} sản phẩm
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ========== FEATURED PRODUCTS ========== */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-number mb-4">— № 04 / Lựa Chọn</p>
            <h2 className="font-display text-display-lg text-ink-900 mb-5">
              Sản phẩm <em className="italic">được yêu thích</em>
            </h2>
            <p className="text-ink-500 font-light">
              Mỗi sản phẩm đều được tuyển chọn kỹ lưỡng, đảm bảo đẹp, bền và phù hợp với không gian sống hiện đại.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-[4/5] shimmer mb-5" />
                  <div className="h-5 shimmer w-2/3 mb-3" />
                  <div className="h-3 shimmer w-full mb-2" />
                  <div className="h-4 shimmer w-1/3" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-display text-2xl text-ink-900 mb-3">
                {loadError ? 'Không tải được sản phẩm' : 'Chưa có sản phẩm nào'}
              </p>
              <p className="text-ink-500 font-light mb-6">
                {loadError
                  ? 'Vui lòng thử lại sau hoặc xem toàn bộ bộ sưu tập.'
                  : 'Bộ sưu tập đang được cập nhật.'}
              </p>
              <Link to="/products" className="btn-luxury-outline">
                Xem Tất Cả Sản Phẩm
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          )}

          <div className="text-center mt-16">
            <Link to="/products" className="btn-luxury-outline">
              Xem Toàn Bộ Bộ Sưu Tập
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== EDITORIAL MANIFESTO ========== */}
      <section className="py-20 md:py-28 bg-ink-900 text-ivory-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5">
              <div className="relative">
                <div className="aspect-[4/5] overflow-hidden hover-zoom">
                  <img
                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=1000&fit=crop"
                    alt="Vườn cây"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -right-8 bg-champagne-400 text-ink-900 p-8 max-w-[200px]">
                  <div className="font-display text-5xl leading-none">10</div>
                  <p className="text-[10px] tracking-widest uppercase font-semibold mt-2">Năm Kiến Tạo</p>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-7">
              <p className="section-number text-ivory-100/50 mb-5">— № 05 / Tuyên Ngôn</p>
              <h2 className="font-display text-display-lg text-ivory-50 leading-[1.05] mb-8">
                Chúng tôi tin rằng cây xanh không chỉ là <em className="italic text-champagne-300">vật trang trí</em> — 
                đó là <em className="italic text-champagne-300">nghệ thuật sống</em>.
              </h2>
              
              <div className="space-y-6 mb-10">
                {editorial.map((item) => (
                  <div key={item.num} className="flex gap-6 pb-6 border-b border-ivory-100/10 last:border-0">
                    <span className="section-number text-champagne-300">{item.num}</span>
                    <div>
                      <h3 className="font-display text-xl text-ivory-50 mb-1">{item.title}</h3>
                      <p className="text-sm text-ivory-100/60 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/about" className="inline-flex items-center gap-2 text-champagne-300 hover:text-champagne-200 text-sm tracking-editorial uppercase font-medium transition-colors">
                Đọc Câu Chuyện Đầy Đủ
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIAL ========== */}
      <section className="py-20 md:py-28">
        <div className="container-narrow text-center">
          <p className="section-number mb-6">— № 06 / Cảm Nhận</p>
          <Quote className="w-10 h-10 text-champagne-300 mx-auto mb-8" strokeWidth={1} />
          <blockquote className="font-display text-3xl md:text-5xl text-ink-900 leading-snug italic">
            "Florist Vietnam đã thay đổi hoàn toàn cách tôi nhìn về cây cảnh. 
            Mỗi lần đặt hàng đều như một trải nghiệm nghệ thuật được gói ghém cẩn thận."
          </blockquote>
          <div className="mt-10">
            <p className="font-display text-lg text-ink-900">Nguyễn Minh Anh</p>
            <p className="text-[10px] tracking-widest uppercase text-ink-500 mt-1">Khách hàng thân thiết — Hà Nội</p>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-20 md:py-28 bg-ivory-100">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-number mb-4">— № 07 / Liên Hệ</p>
              <h2 className="font-display text-display-lg text-ink-900 mb-6">
                Bắt đầu hành trình <em className="italic">xanh</em> của bạn
              </h2>
              <p className="text-ink-600 font-light leading-relaxed mb-8 max-w-md">
                Đội ngũ chuyên gia của chúng tôi sẵn sàng đồng hành cùng bạn 
                trong việc lựa chọn và chăm sóc cây cảnh phù hợp.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="tel:0818596696" className="btn-luxury">
                  Gọi 0818 596 696
                </a>
                <Link to="/contact" className="btn-luxury-outline">
                  Tư Vấn Miễn Phí
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square overflow-hidden hover-zoom">
                <img
                  src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=800&fit=crop"
                  alt="Không gian xanh"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-6 -left-6 bg-ivory-50 p-6 shadow-elevated">
                <p className="text-[10px] tracking-widest uppercase text-champagne-500 font-semibold mb-2">Hotline</p>
                <p className="font-display text-2xl">0818 596 696</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage