/**
 * Static posts data for the "Đi & Viết" (Field Journal) section.
 *
 * Content is migrated from florist.vn (Đi & Viết category). For now this is
 * hardcoded — once the backend Posts API lands, this module will be replaced
 * by `postApi.getAll()` / `postApi.getBySlug()` calls from the components.
 *
 * Each post contains a `content` array of typed blocks (paragraph |
 * subheading | image | callout) so the renderer can lay them out faithfully
 * without resorting to dangerouslySetInnerHTML.
 */

export const posts = [
  {
    slug: 'tham-mo-hinh-trong-hoa-dong-tien-tai-thai-binh',
    title: 'Thăm mô hình trồng hoa đồng tiền tại Thái Bình',
    excerpt:
      'Chúng tôi có dịp về thăm một số làng hoa tại Đông Hưng và Hưng Hà tỉnh Thái Bình vào dịp giáp Tết Nguyên đán Kỷ Hợi 2019. Cả một vùng rộng lớn chủ yếu trồng hoa và các loại cây công trình phục vụ trồng sân vườn, đô thị.',
    coverImage:
      '/uploads/2026/08/Florist_11-1.jpg',
    category: 'Đi & Viết',
    author: 'Florist Vietnam',
    date: '31/12/2019',
    readTime: '6 phút',
    sourceUrl:
      'https://florist.vn/tham-mo-hinh-trong-hoa-dong-tien-tai-thai-binh/',
    content: [
      {
        type: 'paragraph',
        text:
          'Chúng tôi có dịp về thăm một số làng hoa tại Đông Hưng và Hưng Hà tỉnh Thái Bình vào dịp giáp Tết Nguyên đán Kỷ Hợi 2019.',
      },
      {
        type: 'paragraph',
        text:
          'Cả một vùng rộng lớn chủ yếu là trồng hoa và các loại cây công trình phục vụ trồng sân vườn, đô thị. Điều đặc biệt ở đây gần như Bà con lựa chọn cách trồng ngoài trời, nhưng tất cả đều rất đẹp.',
      },
      {
        type: 'subheading',
        text: 'Một số hình ảnh về mô hình trồng hoa đồng tiền',
      },
      {
        type: 'paragraph',
        text:
          'Hoa đồng tiền được Bà con trồng vào bầu đen size nhỏ 13×15cm, được đục thêm rất nhiều lỗ nhỏ phía dưới và được đặt âm một phần trên mặt luống trồng.',
      },
      {
        type: 'image',
        url: '/uploads/2026/08/Florist_11-1.jpg',
        alt: 'Hoa đồng tiền trồng trong bầu đen tại Thái Bình',
        caption:
          'Hoa đồng tiền được trồng vào bầu đen size nhỏ 13×15cm, đục thêm lỗ nhỏ phía dưới và đặt âm một phần trên mặt luống.',
      },
      {
        type: 'paragraph',
        text:
          'Hoa đồng tiền được trồng vào thời điểm từ tháng 7 âm lịch và vì trồng ngoài trời nên Bà con áp dụng một số biện pháp bảo vệ đơn giản mà rất hiệu quả làm giảm thiểu ảnh hưởng của thời tiết tới sự phát triển của cây hoa.',
      },
      {
        type: 'image',
        url: '/uploads/2026/08/Florist_15.jpg',
        alt: 'Cánh đồng hoa đồng tiền tại Thái Bình',
        caption:
          'Một góc cánh đồng hoa đồng tiền trồng ngoài trời tại Thái Bình.',
      },
      {
        type: 'image',
        url: '/uploads/2026/08/Florist_16.jpg',
        alt: 'Bà con chăm sóc luống hoa đồng tiền',
        caption:
          'Bà con áp dụng các biện pháp chăm sóc, bảo vệ đơn giản nhưng hiệu quả cho hoa đồng tiền ngoài trời.',
      },
      {
        type: 'image',
        url: '/uploads/2026/08/Florist_17.jpg',
        alt: 'Hoa đồng tiền sẵn sàng xuất bán',
        caption:
          'Hoa đồng tiền đạt chất lượng, sẵn sàng đóng gói và vận chuyển xuất bán tới khách hàng.',
      },
      {
        type: 'callout',
        text:
          'Bà con cho biết cách trồng này rất phù hợp với điều kiện nuôi trồng trên đồng đất của Bà con và dễ dàng vận chuyển xuất bán mà vẫn đảm bảo được chất lượng tới tay khách hàng.',
      },
      {
        type: 'subheading',
        text: 'Kết luận',
      },
      {
        type: 'paragraph',
        text:
          'Đây cũng là cách làm hay, chi phí sản xuất thấp mà hiệu quả cũng rất cao. Bà con và các bạn muốn tham khảo thêm có thể về trực tiếp Làng hoa hoặc liên hệ với chúng tôi để có thêm thông tin.',
      },
      {
        type: 'callout',
        text: 'Số điện thoại hỗ trợ: 0818 596 696 — Florist Vietnam',
      },
    ],
  },
  {
    slug: 'mo-hinh-san-xuat-hoa-dong-tien-tai-lang-hoa-tay-tuu',
    title: 'Mô hình sản xuất hoa đồng tiền tại Làng hoa Tây Tựu',
    excerpt:
      'Làng hoa Tây Tựu là một trong những làng hoa lâu đời nhất của Hà Nội. Bà con chủ yếu làm nhà màng đơn giản bằng cọc tre nứa phủ màng nilon, trồng đất lên luống cao 50–60cm, dùng phân hữu cơ thay cho phân hóa học.',
    coverImage:
      '/uploads/2026/08/FLv_101.jpg',
    category: 'Đi & Viết',
    author: 'Florist Vietnam',
    date: '01/04/2019',
    readTime: '7 phút',
    sourceUrl:
      'https://florist.vn/mo-hinh-san-xuat-hoa-dong-tien-tai-lang-hoa-tay-tuu/',
    content: [
      {
        type: 'paragraph',
        text:
          'Làng hoa Tây Tựu là một trong những làng hoa lâu đời nhất của Hà Nội. Nhiều năm nay Bà con thường lựa chọn trồng các loại hoa như: Hoa Cúc, Hoa Hồng, Hoa Đồng Tiền, Hoa Loa Kèn, Hoa LyLy,… Trong đó, chủ đạo nhất vẫn là những mô hình trồng Hoa Đồng Tiền.',
      },
      {
        type: 'paragraph',
        text:
          'Hoa Đồng Tiền không chỉ được trồng tại Làng Hoa Tây Tựu mà Bà con đã mở rộng ra các địa phương lân cận như Đan Phượng, Phúc Thọ, Sơn Tây,… để trồng với quy mô và diện tích vùng trồng lớn hơn rất nhiều.',
      },
      {
        type: 'paragraph',
        text:
          'Bà con Làng Hoa Tây Tựu chủ yếu trồng Hoa Đồng Tiền lấy bông (hoa). Vì là làng hoa lâu đời nên Bà con có rất nhiều kinh nghiệm hay áp dụng vào mô hình sản xuất của mình.',
      },
      {
        type: 'subheading',
        text: 'Nhà màng trồng hoa đồng tiền đơn giản',
      },
      {
        type: 'image',
        url: '/uploads/2026/08/FLv_101.jpg',
        alt: 'Nhà màng tre nứa phủ màng nilon trồng hoa đồng tiền tại Tây Tựu',
        caption:
          'Nhà màng làm bằng cọc tre nứa phủ màng nilon — chi phí chỉ khoảng 30.000–35.000đ/m².',
      },
      {
        type: 'paragraph',
        text:
          'Nhà màng trồng hoa, Bà con chủ yếu làm bằng cọc tre nứa, trên phủ màng nilon, chi phí cho nhà màng này tầm 30.000–35.000đ/m². Lý giải cho việc lựa chọn làm theo mô hình này thay bằng làm kiên cố hơn là vì độ bền của nó phù hợp với vòng đời khai thác hoa của cây Hoa Đồng Tiền là từ 4–5 năm, sau đó Bà con vào vụ mới hoặc di chuyển qua khu khác để đầu tư sản xuất tiếp.',
      },
      {
        type: 'subheading',
        text: 'Mật độ trồng và luống đất',
      },
      {
        type: 'image',
        url: '/uploads/2026/08/FLv_105.jpg',
        alt: 'Luống đất cao 50–60cm trồng hoa đồng tiền tại Tây Tựu',
        caption:
          'Luống đất cao 50–60cm, trồng 3 hàng/luống, khoảng cách hàng 30cm, cây cách cây 40cm.',
      },
      {
        type: 'paragraph',
        text:
          'Vì trồng đất để lấy bông và thời gian khai thác dài nên Bà con trồng lên luống rất cao, luống cao từ 50–60 cm, Bà con thường chọn trồng 3 hàng/luống, khoảng cách hàng khoảng 30cm, khoảng cách cây khoảng 40cm.',
      },
      {
        type: 'subheading',
        text: 'Phân bón — ưu tiên hữu cơ',
      },
      {
        type: 'image',
        url: '/uploads/2026/08/Florist_10-scaled.jpg',
        alt: 'Phân hữu cơ ủ từ đậu tương, tro bếp, lân và vôi bột',
        caption:
          'Bà con ủ đậu tương với tro bếp, trộn thêm lân, vôi bột và nấm đối kháng, ủ 4–5 tháng mới dùng.',
      },
      {
        type: 'paragraph',
        text:
          'Về phân bón, đặc biệt Bà con dùng rất ít phân hóa học thay vào đó là Bà con dùng đậu tương ngâm hoặc ủ với tro bếp trộn thêm lân, vôi bột,… ủ nấm đối kháng rồi đóng bao để khoảng 4–5 tháng mới dùng.',
      },
      {
        type: 'callout',
        text:
          'Bà con thu hoạch hoa vào sáng sớm để kịp chuyển đi cho khách hàng. Hoa Bà con ở đây trồng đều rất đẹp, bông to, dài, thật màu và có độ bền cao.',
      },
      {
        type: 'subheading',
        text: 'Hiệu quả kinh tế',
      },
      {
        type: 'image',
        url: '/uploads/2026/08/Florist_11-1.jpg',
        alt: 'Bông hoa đồng tiền thành phẩm tại Tây Tựu',
        caption:
          'Hoa đồng tiền thành phẩm tại Tây Tựu — bông to, dài, thật màu, độ bền cao, giá bán 1.500–2.000đ/bông.',
      },
      {
        type: 'paragraph',
        text:
          'Đây là một trong những mô hình trồng Hoa Đồng Tiền đơn giản, chi phí thấp mà hiệu quả nhất hiện nay, tỷ suất sinh lời cao. Vì Bà con đã dựa trên đặc điểm sinh trưởng của cây để chăm sóc và khai thác một cách hiệu quả. Một cây Hoa Đồng Tiền trồng sau 3 tháng là cho hoa, từ tháng thứ tư trở đi một cây cho thu từ 4–5 bông/tháng và thời gian thu kéo dài đến năm thứ 4, thứ 5 mới phải thay cây giống.',
      },
      {
        type: 'callout',
        text:
          'Giá bán tham khảo xuất tại vườn, Bà con cho biết giá bán trung bình trong năm từ 1.500đ–2.000đ/bông.',
      },
      {
        type: 'paragraph',
        text:
          'Những thông tin cơ bản về mô hình sản xuất Hoa Đồng Tiền tại Làng hoa Tây Tựu, Hà Nội có thể giúp ích một phần cho Bà con và các bạn đang có ý định lựa chọn mô hình trồng hoa đồng tiền. Bà con có nhu cầu cần trao đổi thêm, chúng tôi có thể hỗ trợ thông tin, lập dự án và lựa chọn mô hình sản xuất phù hợp, có hiệu quả nhất cho Bà con.',
      },
      {
        type: 'callout',
        text: 'Thông tin hỗ trợ và tư vấn về mô hình, vui lòng liên hệ: 0818 596 696',
      },
    ],
  },
  {
    slug: 'tham-va-lam-viec-tai-lang-hoa-xuan-quan',
    title: 'Thăm và làm việc tại Làng hoa Xuân Quan',
    excerpt:
      'Xuân Quan là làng hoa nổi tiếng bậc nhất khu vực phía bắc hiện nay. Bà con ở đây trồng đa dạng các loại hoa, tập trung chủ yếu các loại hoa trồng chậu, hoa treo và hoa thảm phục vụ trồng công trình.',
    coverImage:
      '/uploads/2026/08/6.jpg',
    category: 'Đi & Viết',
    author: 'Florist Vietnam',
    date: '29/03/2019',
    readTime: '6 phút',
    sourceUrl:
      'https://florist.vn/tham-va-lam-viec-tai-lang-hoa-xuan-quan/',
    content: [
      {
        type: 'paragraph',
        text:
          'Xuân Quan là làng hoa nổi tiếng bậc nhất khu vực phía bắc hiện nay. Bà con ở đây trồng đa dạng các loại hoa, tập trung chủ yếu các loại hoa trồng chậu, hoa treo và hoa thảm phục vụ trồng công trình,…',
      },
      {
        type: 'subheading',
        text: 'Nhà màng kiên cố với khung thép mạ kẽm',
      },
      {
        type: 'paragraph',
        text:
          'Nhà màng trồng hoa được Bà con đầu tư rất kiên cố, mô hình sử dụng ống thép mạ kẽm, phủ màng nilon, phổ biến là nhà có giàn treo, ở dưới đặt hoa chậu, ở trên đặt hoa treo. Chi phí đầu tư nhà màng loại này tầm 150–170 ngàn/m².',
      },
      {
        type: 'subheading',
        text: 'Chậu trồng và giá thể',
      },
      {
        type: 'paragraph',
        text:
          'Bà con chủ yếu lựa chọn trồng hoa trên bầu đen mềm, loại phổ biến là size 16×18cm. Một số loại hoa được trồng trên chậu nhựa cứng, chậu treo. Diện tích tầm 9–10 chậu/m².',
      },
      {
        type: 'paragraph',
        text:
          'Giá thể trồng: Bà con thường sử dụng đất, trấu hun, đặc biệt là sỉ than. Một số hộ thì lựa chọn trồng trên giá thể nhập khẩu.',
      },
      {
        type: 'subheading',
        text: 'Hoa đồng tiền — cây trồng chủ lực',
      },
      {
        type: 'paragraph',
        text:
          'Hoa đồng tiền vẫn là nhóm cây trồng chủ lực tại các nhà vườn của Làng hoa Xuân Quan. Đây là loại hoa được Bà con trồng quanh năm, thời gian trồng 2,5–3 tháng khi cây bắt đầu có nụ là xuất bán, sau đó Bà con sẽ vào đợt mới, trung bình khoảng 3–4 vụ/năm.',
      },
      {
        type: 'callout',
        text:
          'Trên là một số thông tin về mô hình sản xuất hoa tại Làng hoa Xuân Quan, Hưng Yên do nhóm công tác FLv thực hiện trong chuyến thăm và đánh giá chất lượng cây giống hoa đồng tiền do Florist Vietnam cung cấp.',
      },
      {
        type: 'paragraph',
        text:
          'Bà con có nhu cầu tham khảo, tìm hiểu thêm thông tin vui lòng liên hệ bộ phận hỗ trợ theo số: 0818 596 696.',
      },
      {
        type: 'callout',
        text: 'Hưng Yên, ngày 29/3/2019 — Florist Vietnam',
      },
    ],
  },
]

/**
 * Convenience getters — mimic what the future Post API will return so the
 * page components don't need to change when the API lands.
 */
export function getAllPosts() {
  return posts
}

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug) || null
}

export function getRelatedPosts(currentSlug, limit = 2) {
  return posts.filter((p) => p.slug !== currentSlug).slice(0, limit)
}
