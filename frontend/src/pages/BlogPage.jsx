import { Link } from 'react-router-dom'
import BlogPostCard from '../components/BlogPostCard'
import { getAllPosts } from '../data/posts'

function BlogPage() {
  const posts = getAllPosts()
  const [featured, ...rest] = posts

  return (
    <div className="bg-ivory-50">
      {/* Header */}
      <section className="pt-12 md:pt-20 pb-12 md:pb-16">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-[11px] tracking-widest uppercase mb-10">
            <Link
              to="/"
              className="text-ink-500 hover:text-ink-900 transition-colors"
            >
              Trang Chủ
            </Link>
            <span className="text-ink-300">/</span>
            <span className="text-ink-900 font-medium">Đi & Viết</span>
          </nav>

          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <p className="section-number mb-4">— Đi & Viết / Field Journal</p>
              <h1 className="font-display text-display-xl text-ink-900">
                Đi &amp; <em className="italic text-champagne-500">Viết</em>
              </h1>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-ink-600 leading-relaxed font-light">
                Những chuyến đi thực địa, ghi chép từ các làng hoa và hành
                trình đồng hành cùng Bà con — nơi chúng tôi chia sẻ câu chuyện
                thật về nghề trồng hoa và cây cảnh.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom">
        <div className="divider-thin" />
      </div>

      {/* Featured article */}
      {featured && (
        <section className="py-12 md:py-16">
          <div className="container-custom">
            <BlogPostCard post={featured} featured />
          </div>
        </section>
      )}

      {/* Articles grid */}
      {rest.length > 0 && (
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

            <div className="grid md:grid-cols-2 gap-x-6 gap-y-14 max-w-5xl">
              {rest.map((post, i) => (
                <BlogPostCard
                  key={post.slug}
                  post={post}
                  index={i + 2}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default BlogPage
