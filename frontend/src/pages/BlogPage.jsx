import { Link } from 'react-router-dom'
import { Calendar, User, ArrowRight } from 'lucide-react'

const blogPosts = [
  {
    id: 1,
    title: 'Cách chăm sóc hoa đồng tiền đúng cách',
    excerpt: 'Hướng dẫn chi tiết cách trồng và chăm sóc hoa đồng tiền để cây ra hoa đẹp quanh năm.',
    image: 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=600&h=400&fit=crop',
    category: 'Kinh nghiệm',
    author: 'Florist Vietnam',
    date: '15/01/2024',
  },
  {
    id: 2,
    title: 'Top 5 cây cảnh phù hợp cho văn phòng',
    excerpt: 'Những loại cây xanh không chỉ đẹp mà còn giúp thanh lọc không khí trong không gian làm việc.',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&h=400&fit=crop',
    category: 'Kinh nghiệm',
    author: 'Florist Vietnam',
    date: '10/01/2024',
  },
  {
    id: 3,
    title: 'Kỹ thuật trồng lan ý trong chậu',
    excerpt: 'Tìm hiểu cách trồng và chăm sóc cây lan ý để ra hoa đẹp, bền lâu.',
    image: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=600&h=400&fit=crop',
    category: 'Kinh nghiệm',
    author: 'Florist Vietnam',
    date: '05/01/2024',
  },
  {
    id: 4,
    title: 'Tham quan vườn ươm cây giống Florist',
    excerpt: 'Cùng khám phá quy trình sản xuất cây giống chất lượng cao tại Florist Vietnam.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    category: 'Đi & Viết',
    author: 'Florist Vietnam',
    date: '01/01/2024',
  },
]

function BlogPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-primary-900 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog - Kinh nghiệm</h1>
            <p className="text-xl text-white/90">
              Chia sẻ kiến thức và kinh nghiệm về cây cảnh
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="container-custom">
          <Link to="/kinh-nghiem/cach-cham-soc-hoa-dong-tien" className="block">
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <span className="inline-block px-3 py-1 bg-primary-600 rounded-full text-sm mb-4">
                  {blogPosts[0].category}
                </span>
                <h2 className="text-3xl font-bold mb-4 group-hover:text-primary-300 transition-colors">
                  {blogPosts[0].title}
                </h2>
                <p className="text-white/80 mb-4 max-w-2xl">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {blogPosts[0].author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {blogPosts[0].date}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-16">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Bài viết mới nhất</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Link 
                key={post.id} 
                to={`/kinh-nghiem/${post.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-primary-600 text-white text-sm rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="btn-secondary">
              Xem thêm bài viết
              <ArrowRight className="inline w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Đăng ký nhận tin từ Florist Vietnam
            </h2>
            <p className="text-gray-600 mb-8">
              Để lại email để nhận những tin tức mới nhất về cây cảnh và ưu đãi đặc biệt
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BlogPage
