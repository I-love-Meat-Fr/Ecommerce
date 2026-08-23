import { Link } from 'react-router-dom'
import { Target, Eye, Heart, Award, Users, Truck, Leaf, ArrowUpRight, Sparkles } from 'lucide-react'

const values = [
  {
    icon: Leaf,
    title: 'Sản phẩm chất lượng',
    description: 'Florist Vietnam đặt ra mục tiêu xuyên suốt là tạo ra được những sản phẩm có giá trị, chất lượng cao nhất.',
  },
  {
    icon: Target,
    title: 'Giá thành hợp lý',
    description: 'Tự hào là đơn vị hàng đầu trong lĩnh vực nghiên cứu & sản xuất HOA cung cấp ra thị trường những sản phẩm chất lượng cao với giá thành hợp lý.',
  },
  {
    icon: Heart,
    title: 'Dịch vụ tận tâm',
    description: 'Florist Vietnam hiện đang phục vụ trên hàng nghìn khách hàng tại Hà Nội & các tỉnh thành lân cận với sự tận tâm cao nhất.',
  },
]

const team = [
  { name: 'Nguyễn Văn A', role: 'Giám Đốc', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=700&fit=crop' },
  { name: 'Trần Thị B', role: 'Quản Lý Sản Xuất', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=700&fit=crop' },
  { name: 'Lê Văn C', role: 'Chuyên Gia Cây Trồng', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=700&fit=crop' },
  { name: 'Phạm Thị D', role: 'Tư Vấn Thiết Kế', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=700&fit=crop' },
]

const stats = [
  { value: '10+', label: 'Năm Kinh Nghiệm' },
  { value: '2K+', label: 'Khách Hàng Hài Lòng' },
  { value: '50+', label: 'Giống Cây Chất Lượng' },
  { value: '24/7', label: 'Hỗ Trợ Tư Vấn' },
]

function AboutPage() {
  return (
    <div className="bg-ivory-50">
      {/* Editorial Header */}
      <section className="pt-12 md:pt-20 pb-16">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-[11px] tracking-widest uppercase mb-10">
            <Link to="/" className="text-ink-500 hover:text-ink-900 transition-colors">Trang Chủ</Link>
            <span className="text-ink-300">/</span>
            <span className="text-ink-900 font-medium">Câu Chuyện</span>
          </nav>

          <div className="grid md:grid-cols-12 gap-10 mb-16">
            <div className="md:col-span-7">
              <p className="section-number mb-4">— Maison / Câu Chuyện</p>
              <h1 className="font-display text-display-2xl text-ink-900">
                Mười năm <em className="italic text-champagne-500">kiến tạo</em> không gian xanh
              </h1>
            </div>
            <div className="md:col-span-4 md:col-start-9 pt-8">
              <p className="text-ink-600 leading-relaxed font-light">
                Florist Vietnam là doanh nghiệp hoạt động trong lĩnh vực nông nghiệp công nghệ cao, 
                chuyên về HOA & CÂY GIỐNG có giá trị kinh tế cao. Hành trình của chúng tôi bắt đầu 
                từ niềm đam mê với thiên nhiên và khát vọng mang vẻ đẹp tinh tế đến mọi không gian sống.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero image */}
      <section className="mb-20 md:mb-28">
        <div className="container-custom">
          <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden hover-zoom">
            <img
              src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&h=900&fit=crop"
              alt="Vườn cây Florist"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-20 bg-ink-900 text-ivory-50">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-700">
            {stats.map((s, i) => (
              <div key={i} className="bg-ink-900 p-10 md:p-12 text-center">
                <div className="font-display text-display-lg text-champagne-300 mb-3">
                  {s.value}
                </div>
                <p className="text-[10px] tracking-widest uppercase text-ivory-100/60 font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="md:col-span-6">
              <div className="aspect-[4/5] overflow-hidden hover-zoom">
                <img
                  src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=1000&fit=crop"
                  alt="Sứ mệnh"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-6 lg:col-start-8">
              <p className="section-number mb-4">— Sứ Mệnh</p>
              <h2 className="font-display text-display-lg text-ink-900 mb-6">
                Mang thiên nhiên <em className="italic text-champagne-500">vào</em> từng không gian
              </h2>
              <p className="text-ink-600 leading-relaxed font-light mb-5">
                Với trách nhiệm nghiên cứu, lai tạo và trồng thử nghiệm các giống hoa mới, 
                có giá trị kinh tế, phù hợp với điều kiện tự nhiên của Miền Bắc Việt Nam, 
                chúng tôi không ngừng nỗ lực để mang đến những sản phẩm tốt nhất.
              </p>
              <p className="text-ink-600 leading-relaxed font-light">
                Florist Vietnam tin rằng mỗi không gian sống đều xứng đáng được tô điểm 
                bởi vẻ đẹp của thiên nhiên — một cách tinh tế, hiện đại và bền vững.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-ivory-100">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-number mb-4">— Giá Trị Cốt Lõi</p>
            <h2 className="font-display text-display-lg text-ink-900">
              Những điều chúng tôi <em className="italic">theo đuổi</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-ivory-300">
            {values.map((v, i) => (
              <div key={i} className="bg-ivory-100 p-10 md:p-12 group hover:bg-ivory-50 transition-colors duration-500">
                <div className="flex items-start justify-between mb-8">
                  <v.icon className="w-8 h-8 text-ink-900 group-hover:text-champagne-500 transition-colors" strokeWidth={1.25} />
                  <span className="section-number">№ {String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="font-display text-2xl text-ink-900 mb-4 leading-snug">{v.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed font-light">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <p className="section-number mb-4">— Đội Ngũ</p>
              <h2 className="font-display text-display-lg text-ink-900">
                Những người <em className="italic">đứng sau</em> Florist
              </h2>
            </div>
            <Link to="/contact" className="link-editorial self-start md:self-end">
              Gặp Gỡ Chúng Tôi
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {team.map((member, i) => (
              <div key={i} className="group">
                <div className="aspect-[4/5] overflow-hidden bg-ivory-200 mb-5 hover-zoom">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <p className="section-number mb-2">№ {String(i + 1).padStart(2, '0')}</p>
                <h3 className="font-display text-xl text-ink-900 mb-1">{member.name}</h3>
                <p className="text-xs tracking-widest uppercase text-ink-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage