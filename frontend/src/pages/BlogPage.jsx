import { Link } from 'react-router-dom'
import { Calendar, ArrowUpRight, Clock } from 'lucide-react'

const blogPosts = [
  {
    id: 1, title: 'Cách chăm sóc hoa đồng tiền đúng cách',
    excerpt: 'Hướng dẫn chi tiết cách trồng và chăm sóc hoa đồng tiền để cây ra hoa đẹp quanh năm.',
    image: 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=900&h=1100&fit=crop',
    category: 'Kinh Nghiệm',
    author: 'Florist Vietnam',
    date: '15/01/2024',
    readTime: '5 phút',
  },
  {
    id: 2, title: 'Top 5 cây cảnh phù hợp cho văn phòng',
    excerpt: 'Những loại cây xanh không chỉ đẹp mà còn giúp thanh lọc không khí trong không gian làm việc.',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=900&h=1100&fit=crop',
    category: 'Không Gian',
    author: 'Florist Vietnam',
    date: '10/01/2024',
    readTime: '7 phút',
  },
  {
    id: 3, title: 'Kỹ thuật trồng lan ý trong chậu',
    excerpt: 'Tìm hiểu cách trồng và chăm sóc cây lan ý để ra hoa đẹp, bền lâu.',
    image: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=900&h=1100&fit=crop',
    category: 'Kỹ Thuật',
    author: 'Florist Vietnam',
    date: '05/01/2024',
    readTime: '6 phút',
  },
  {
    id: 4, title: 'Phong thủy cây xanh cho không gian sống',
    excerpt: 'Khám phá ý nghĩa phong thủy của các loại cây cảnh phổ biến trong văn hóa Việt.',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=900&h=1100&fit=crop',
    category: 'Phong Thủy',
    author: 'Florist Vietnam',
    date: '28/12/2023',
    readTime: '8 phút',
  },
]

function BlogPage() {
  return (
    <div className="bg-ivory-50">
      {/* Header */}
      <section className="pt-12 md:pt-20 pb-12 md:pb-16">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-[11px] tracking-widest uppercase mb-10">
            <Link to="/" className="text-ink-500 hover:text-ink-900 transition-colors">Trang Chủ</Link>
            <span className="text-ink-300">/</span>
            <span className="text-ink-900 font-medium">Tạp Chí</span>
          </nav>

          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <p className="section-number mb-4">— Tạp Chí / Journal</p>
              <h1 className="font-display text-display-xl text-ink-900">
                Câu chuyện <em className="italic text-champagne-500">&</em> cảm hứng
              </h1>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-ink-600 leading-relaxed font-light">
                Nơi chúng tôi chia sẻ những câu chuyện, kiến thức và cảm hứng về 
                nghệ thuật chăm sóc cây cảnh và không gian sống.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom"><div className="divider-thin" /></div>

      {/* Featured article */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <Link to="#" className="group block">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-ivory-200 hover-zoom">
                <img src={blogPosts[0].image} alt={blogPosts[0].title} className="w-full h-full object-cover" />
              </div>
              <div className="lg:col-span-5">
                <div className="flex items-center gap-4 mb-6">
                  <span className="badge-gold">Nổi Bật</span>
                  <span className="text-[10px] tracking-widest uppercase text-ink-500 font-medium">{blogPosts[0].category}</span>
                </div>
                <h2 className="font-display text-3xl md:text-5xl text-ink-900 leading-tight mb-6 group-hover:text-champagne-500 transition-colors">
                  {blogPosts[0].title}
                </h2>
                <p className="text-ink-600 font-light leading-relaxed mb-8">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-ink-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" strokeWidth={1.5} />
                    {blogPosts[0].date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    {blogPosts[0].readTime}
                  </span>
                </div>
                <div className="mt-8">
                  <span className="link-editorial">
                    Đọc Tiếp
                    <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-12 md:py-20">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-number mb-3">— Bài Viết Mới</p>
              <h2 className="font-display text-display-lg text-ink-900">
                Khám phá <em className="italic">thêm</em>
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-x-6 gap-y-14">
            {blogPosts.slice(1).map((post, i) => (
              <Link key={post.id} to="#" className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-ivory-200 mb-5 hover-zoom">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[10px] tracking-widest uppercase text-champagne-500 font-semibold">{post.category}</span>
                  <span className="text-ink-300">—</span>
                  <span className="section-number">№ {String(i + 2).padStart(2, '0')}</span>
                </div>
                <h3 className="font-display text-2xl text-ink-900 leading-snug mb-3 group-hover:text-champagne-500 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-ink-500 font-light leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-[11px] text-ink-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" strokeWidth={1.5} />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    {post.readTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default BlogPage