import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, ArrowRight, Check } from 'lucide-react'

const storeLocations = [
  {
    name: 'Văn Giang - Hưng Yên',
    address: '23, Thung Lũng Mùa Xuân, KĐT Ecopark, Văn Giang, Hưng Yên',
    phone: '0818 596 696',
    hours: '8:00 - 18:00 (T2 - CN)',
  },
  {
    name: 'Hà Nội',
    address: '123 Đường ABC, Quận Cầu Giấy, Hà Nội',
    phone: '0818 596 696',
    hours: '8:00 - 20:00 (T2 - CN)',
  },
]

function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    }, 1500)
  }

  return (
    <div className="bg-ivory-50">
      {/* Header */}
      <section className="pt-12 md:pt-20 pb-12">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-[11px] tracking-widest uppercase mb-10">
            <Link to="/" className="text-ink-500 hover:text-ink-900 transition-colors">Trang Chủ</Link>
            <span className="text-ink-300">/</span>
            <span className="text-ink-900 font-medium">Liên Hệ</span>
          </nav>

          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-7">
              <p className="section-number mb-4">— Liên Hệ / Maison</p>
              <h1 className="font-display text-display-xl text-ink-900">
                Hãy để chúng tôi <em className="italic text-champagne-500">đồng hành</em> cùng bạn
              </h1>
            </div>
            <div className="md:col-span-4 md:col-start-9 pt-4">
              <p className="text-ink-600 font-light leading-relaxed">
                Đội ngũ chuyên gia của Florist Vietnam luôn sẵn sàng lắng nghe và 
                đồng hành cùng bạn trong hành trình tìm kiếm những sản phẩm phù hợp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom"><div className="divider-thin" /></div>

      {/* Contact info + Form */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* Left - Form */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-ivory-100 p-8 md:p-12">
                <p className="section-number mb-3">— Gửi Tin Nhắn</p>
                <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-2">
                  Viết cho <em className="italic">chúng tôi</em>
                </h2>
                <p className="text-sm text-ink-500 mb-10 font-light">
                  Chúng tôi sẽ phản hồi trong vòng 24 giờ.
                </p>

                {submitted && (
                  <div className="mb-8 p-4 bg-ink-900 text-ivory-50 flex items-center gap-3">
                    <Check className="w-5 h-5 text-champagne-300" strokeWidth={1.5} />
                    <span className="text-sm">Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] tracking-widest uppercase text-ink-500 font-semibold block mb-2">
                        Họ & Tên *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-editorial"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-widest uppercase text-ink-500 font-semibold block mb-2">
                        Số Điện Thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-editorial"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] tracking-widest uppercase text-ink-500 font-semibold block mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-editorial"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] tracking-widest uppercase text-ink-500 font-semibold block mb-2">
                      Tiêu Đề
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="input-editorial"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] tracking-widest uppercase text-ink-500 font-semibold block mb-2">
                      Tin Nhắn *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="input-editorial resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-luxury w-full md:w-auto"
                  >
                    {submitting ? 'Đang Gửi...' : 'Gửi Tin Nhắn'}
                    {!submitting && <ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                </form>
              </div>
            </div>

            {/* Right - Contact info */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="space-y-12">
                {/* Quick contact */}
                <div>
                  <p className="section-number mb-4">— Liên Hệ Nhanh</p>
                  <h2 className="font-display text-3xl text-ink-900 mb-8">
                    Trực tiếp <em className="italic">với</em> chúng tôi
                  </h2>
                  
                  <div className="space-y-6">
                    <a href="tel:0818596696" className="group flex items-start gap-4 pb-6 border-b border-ivory-300">
                      <Phone className="w-5 h-5 mt-1 text-champagne-500 flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-2 font-semibold">Hotline</p>
                        <p className="font-display text-2xl text-ink-900 group-hover:text-champagne-500 transition-colors">0818 596 696</p>
                      </div>
                    </a>

                    <a href="mailto:floristviet@gmail.com" className="group flex items-start gap-4 pb-6 border-b border-ivory-300">
                      <Mail className="w-5 h-5 mt-1 text-champagne-500 flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-ink-500 mb-2 font-semibold">Email</p>
                        <p className="font-display text-2xl text-ink-900 group-hover:text-champagne-500 transition-colors">floristviet@gmail.com</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Stores */}
                <div>
                  <p className="section-number mb-4">— Cửa Hàng</p>
                  <h3 className="font-display text-2xl text-ink-900 mb-6">Hệ thống</h3>
                  
                  <div className="space-y-6">
                    {storeLocations.map((store, i) => (
                      <div key={i} className="group p-6 border border-ivory-300 hover:border-ink-900 transition-colors">
                        <div className="flex items-start gap-4">
                          <MapPin className="w-5 h-5 mt-1 text-champagne-500 flex-shrink-0" strokeWidth={1.5} />
                          <div className="flex-1">
                            <h4 className="font-display text-lg text-ink-900 mb-2">{store.name}</h4>
                            <p className="text-sm text-ink-500 font-light mb-2">{store.address}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500 mt-3 pt-3 border-t border-ivory-300">
                              <span className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3" /> {store.phone}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> {store.hours}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage