import { Link } from 'react-router-dom'
import { Target, Eye, Heart, Award, Users, Truck, Leaf } from 'lucide-react'

const values = [
  {
    icon: Leaf,
    title: 'Sản phẩm chất lượng',
    description: 'Florist Vietnam đặt ra mục tiêu xuyên suốt là tạo ra được những sản phẩm có giá trị, chất lượng cao nhất.',
  },
  {
    icon: Target,
    title: 'Giá thành hợp lý',
    description: 'Florist Vietnam tự hào là một trong những đơn vị hàng đầu trong lĩnh vực nghiên cứu & sản xuất HOA cung cấp ra những sản phẩm chất lượng cao nhưng vẫn đảm bảo được giá thành hợp lý nhất tới tay Quý Khách hàng.',
  },
  {
    icon: Heart,
    title: 'Dịch vụ khách hàng tốt nhất',
    description: 'Florist Vietnam hiện đang phục vụ trên hàng nghìn khách hàng tại Hà Nội & các tỉnh thành lân cận.',
  },
]

const team = [
  {
    name: 'Nguyễn Văn A',
    role: 'Giám đốc',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop',
  },
  {
    name: 'Trần Thị B',
    role: 'Quản lý sản xuất',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
  },
  {
    name: 'Lê Văn C',
    role: 'Kỹ sư nông nghiệp',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
  },
]

function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-primary-900 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Về Florist Vietnam</h1>
            <p className="text-xl text-white/90">
              Florist Vietnam - Điểm đến tin cậy cho những người yêu cây cảnh
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-600 font-semibold">Câu chuyện của chúng tôi</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-6">
                Hơn 10 năm kinh nghiệm trong lĩnh vực cây cảnh
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Florist Vietnam là một doanh nghiệp trẻ, hoạt động trong lĩnh vực nông nghiệp công nghệ cao, 
                  chuyên về HOA & CÂY GIỐNG có giá trị kinh tế cao.
                </p>
                <p>
                  Với trách nhiệm nghiên cứu, lai tạo và trồng thử nghiệm các giống hoa mới, có giá trị kinh tế, 
                  phù hợp với điều kiện tự nhiên của Miền Bắc Việt Nam.
                </p>
                <p>
                  Florist Vietnam đang không ngừng nỗ lực để phục vụ Khách hàng một cách tốt nhất. 
                  Chúng tôi luôn luôn đặt mục tiêu CHẤT LƯỢNG – SỰ HÀI LÒNG CỦA KHÁCH HÀNG lên hàng đầu.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=500&fit=crop"
                alt="Vườn cây Florist"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="text-4xl font-bold text-primary-600">10+</div>
                <div className="text-gray-600">Năm kinh nghiệm</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tầm nhìn</h3>
              <p className="text-gray-600">
                "Trở thành biểu tượng tuổi trẻ, sáng tạo, vươn lên Việt Nam về nghiên cứu, 
                lai tạo & sản xuất nguồn giống hoa mới phục vụ nhu cầu phát triển kinh tế xã hội."
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sứ mệnh</h3>
              <p className="text-gray-600">
                "Mục tiêu xuyên suốt của Florist Vietnam là nỗ lực không ngừng để tạo ra được 
                những giống hoa mới có giá trị cao nhất có thể."
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Giá trị cốt lõi</h3>
              <p className="text-gray-600">
                "Florist Vietnam tập trung tối đa nguồn lực vào sự phát triển con người toàn diện. 
                Góp phần tạo ra được những sản phẩm & dịch vụ tốt nhất phục vụ cộng đồng."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '1000+', label: 'Khách hàng', icon: Users },
              { value: '50+', label: 'Loại cây giống', icon: Leaf },
              { value: '100%', label: 'Chất lượng', icon: Award },
              { value: '24h', label: 'Giao hàng', icon: Truck },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Giá trị của chúng tôi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <value.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Đội ngũ của chúng tôi</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Đội ngũ chuyên gia nông nghiệp giàu kinh nghiệm của Florist Vietnam
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-600 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Bạn muốn hợp tác với Florist Vietnam?</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hợp tác với các đối tác để cùng phát triển
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/lien-he" className="btn-primary bg-white text-primary-700 hover:bg-gray-100">
              Liên hệ ngay
            </Link>
            <Link to="/san-pham" className="btn-secondary border-white text-white hover:bg-white/10">
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
