import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Calendar, Clock, ArrowLeft, ArrowUpRight } from 'lucide-react'
import {
  getPostBySlug,
  getRelatedPosts,
  getAllPosts,
} from '../data/posts'
import BlogPostCard from '../components/BlogPostCard'

/**
 * Render a single content block from a post's `content` array.
 * Supports: paragraph | subheading | callout.
 */
function ContentBlock({ block }) {
  switch (block.type) {
    case 'subheading':
      return (
        <h2 className="font-display text-3xl text-ink-900 mt-12 mb-4">
          {block.text}
        </h2>
      )
    case 'callout':
      return (
        <blockquote className="my-10 border-l-2 border-champagne-500 pl-6 py-4 bg-ivory-100">
          <p className="font-display text-xl text-ink-900 italic leading-relaxed">
            {block.text}
          </p>
        </blockquote>
      )
    case 'image':
      return (
        <figure className="my-12">
          <div className="bg-ivory-200">
            <img
              src={block.url}
              alt={block.alt || ''}
              loading="lazy"
              className="block mx-auto max-h-[640px] w-auto max-w-full object-contain"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-sm text-ink-500 italic text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    case 'paragraph':
    default:
      return (
        <p className="text-ink-700 font-light leading-relaxed text-lg mb-6">
          {block.text}
        </p>
      )
  }
}

function BlogPostPage() {
  const { slug } = useParams()
  const post = getPostBySlug(slug)

  // When switching between blog posts (e.g. clicking "Bài viết khác" at the
  // bottom), scroll the new post into view from the top. `instant` avoids the
  // default smooth-scroll animation being interrupted by React re-renders.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [slug])

  if (!post) {
    const all = getAllPosts()
    return (
      <div className="bg-ivory-50">
        <section className="container-custom py-32 text-center">
          <p className="section-number mb-3">— 404</p>
          <h1 className="font-display text-display-lg text-ink-900 mb-6">
            Bài viết không tồn tại
          </h1>
          <p className="text-ink-600 font-light mb-10 max-w-md mx-auto">
            Bài viết bạn tìm không có trong nhật ký Đi & Viết của chúng tôi. Có
            thể nó đã được di chuyển hoặc đường dẫn không chính xác.
          </p>
          <Link to="/di-va-viet" className="link-editorial">
            ← Quay lại Đi & Viết
          </Link>

          <div className="mt-20">
            <p className="section-number mb-3">— Hoặc đọc</p>
            <h2 className="font-display text-display-lg text-ink-900 mb-12">
              Bài viết <em className="italic">khác</em>
            </h2>
            <div className="grid md:grid-cols-3 gap-x-6 gap-y-14 text-left">
              {all.slice(0, 3).map((p) => (
                <BlogPostCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  const related = getRelatedPosts(post.slug, 2)
  // Index of this post within all posts (1-based) for the № badge.
  const postIndex = getAllPosts().findIndex((p) => p.slug === post.slug) + 1

  return (
    <div className="bg-ivory-50">
      {/* Hero / title block */}
      <section className="pt-12 md:pt-16 pb-10">
        <div className="container-custom max-w-4xl">
          <Link
            to="/di-va-viet"
            className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-ink-500 hover:text-ink-900 transition-colors mb-10"
          >
            <ArrowLeft className="w-3 h-3" strokeWidth={1.5} />
            Đi & Viết
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <span className="badge-gold">{post.category}</span>
            <span className="section-number">
              № {String(postIndex).padStart(2, '0')}
            </span>
          </div>

          <h1 className="font-display text-display-lg text-ink-900 leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-ink-600 font-light leading-relaxed text-lg mb-8 max-w-3xl">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-ink-500 pb-10 border-b border-ivory-200">
            <span className="text-ink-700">{post.author}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" strokeWidth={1.5} />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* Cover image */}
      <section className="pb-12 md:pb-16">
        <div className="container-custom max-w-5xl">
          <div className="aspect-[16/9] overflow-hidden bg-ivory-200">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article body */}
      <article className="pb-20">
        <div className="container-custom max-w-3xl">
          {post.content.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}

          {post.sourceUrl && (
            <div className="mt-12 pt-8 border-t border-ivory-200 text-sm text-ink-500 font-light">
              <p>
                Nguồn:{' '}
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-champagne-500 hover:text-champagne-600 underline underline-offset-2"
                >
                  florist.vn ↗
                </a>
              </p>
            </div>
          )}
        </div>
      </article>

      <div className="container-custom">
        <div className="divider-thin" />
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container-custom">
            <div className="mb-12">
              <p className="section-number mb-3">— Đọc tiếp</p>
              <h2 className="font-display text-display-lg text-ink-900">
                Bài viết <em className="italic">liên quan</em>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-14 max-w-4xl">
              {related.map((p, i) => (
                <BlogPostCard key={p.slug} post={p} index={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default BlogPostPage
