import { Link } from 'react-router-dom'
import { Calendar, Clock, ArrowUpRight } from 'lucide-react'

/**
 * Blog post card — editorial layout matching the Florist design system.
 *
 * Props:
 *  - post: { slug, title, excerpt, coverImage, category, date, readTime }
 *  - featured: when true, renders as a wide 16/10 hero card.
 *  - index: number used for the "№ XX" badge (1-indexed).
 *  - showArrow: whether to render the "Đọc tiếp" arrow link (default true).
 */
export default function BlogPostCard({ post, featured = false, index, showArrow = true }) {
  return (
    <Link to={`/di-va-viet/${post.slug}`} className="group block">
      {featured ? (
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-ivory-200 hover-zoom">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <span className="badge-gold">Nổi Bật</span>
              <span className="text-[10px] tracking-widest uppercase text-ink-500 font-medium">
                {post.category}
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl text-ink-900 leading-tight mb-6 group-hover:text-champagne-500 transition-colors">
              {post.title}
            </h2>
            <p className="text-ink-600 font-light leading-relaxed mb-8">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" strokeWidth={1.5} />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" strokeWidth={1.5} />
                {post.readTime}
              </span>
            </div>
            {showArrow && (
              <div className="mt-8">
                <span className="link-editorial">
                  Đọc tiếp
                  <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="aspect-[4/5] overflow-hidden bg-ivory-200 mb-5 hover-zoom">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-[10px] tracking-widest uppercase text-champagne-500 font-semibold">
              {post.category}
            </span>
            <span className="text-ink-300">—</span>
            {index != null && (
              <span className="section-number">
                № {String(index).padStart(2, '0')}
              </span>
            )}
          </div>
          <h3 className="font-display text-2xl text-ink-900 leading-snug mb-3 group-hover:text-champagne-500 transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-ink-500 font-light leading-relaxed mb-4 line-clamp-2">
            {post.excerpt}
          </p>
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
          {showArrow && (
            <div className="mt-4">
              <span className="link-editorial">
                Đọc tiếp
                <ArrowUpRight className="w-3 h-3 inline ml-1" strokeWidth={2} />
              </span>
            </div>
          )}
        </>
      )}
    </Link>
  )
}
