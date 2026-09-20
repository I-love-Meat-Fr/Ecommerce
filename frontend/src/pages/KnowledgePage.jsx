import { Link } from 'react-router-dom'
import BlogPostCard from '../components/BlogPostCard'
import { getAllPosts } from '../data/posts'

/**
 * Knowledge listing page — surfaces the "Kinh nghiệm" editorial category.
 * Mirrors `BlogPage` (Đi & Viết) so visiting any category page feels
 * consistent: hero header + featured story + 2-up grid for the rest.
 */
function KnowledgePage() {
  const all = getAllPosts().filter((p) => p.category === 'Kinh nghiệm')
  const [featured, ...rest] = all

  if (!featured) {
    return (
      <div className="bg-ivory-50">
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
              <span className="text-ink-900 font-medium">Kinh nghiệm</span>
            </nav>

            <p className="section-number mb-4">— Kinh nghiệm / Field Notes</p>
            <h1 className="font-display text-display-xl text-ink-900">
              Kinh <em className="italic text-champagne-500">nghiệm</em>
            </h1>
          </div>
        </section>

        <section className="container-custom py-24 text-center">
          <p className="section-number mb-3">— Trống</p>
          <h2 className="font-display text-display-lg text-ink-900 mb-6">
            Chưa có bài viết nào
          </h2>
          <p className="text-ink-600 font-light max-w-md mx-auto">
            Mục Kinh nghiệm đang được chúng tôi cập nhật. Hãy quay lại sau để
            đọc những chia sẻ hữu ích từ đội ngũ Florist Vietnam.
          </p>
        </section>
      </div>
    )
  }

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
            <span className="text-ink-900 font-medium">Kinh nghiệm</span>
          </nav>

          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <p className="section-number mb-4">
                — Kinh nghiệm / Field Notes
              </p>
              <h1 className="font-display text-display-xl text-ink-900">
                Kinh <em className="italic text-champagne-500">nghiệm</em>
              </h1>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-ink-600 leading-relaxed font-light">
                Những ghi chép kỹ thuật, mẹo chăm sóc và hướng dẫn thực hành
                từ đội ngũ Florist Vietnam — dành cho Bà con và khách hàng yêu
                cây, hoa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom">
        <div className="divider-thin" />
      </div>

      {/* Featured article */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <BlogPostCard post={featured} featured />
        </div>
      </section>

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

export default KnowledgePage
