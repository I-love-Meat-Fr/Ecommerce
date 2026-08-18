# Florist Vietnam - Frontend

Frontend được xây dựng bằng **React + Vite** kết nối với .NET API backend.

## Công nghệ sử dụng

- **React 18** - Thư viện UI
- **Vite** - Build tool
- **React Router v6** - Routing
- **Zustand** - State management (Giỏ hàng)
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── components/     # Components dùng chung
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── MobileMenu.jsx
│   │   ├── Layout.jsx
│   │   └── ProductCard.jsx
│   ├── pages/          # Các trang của ứng dụng
│   │   ├── HomePage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ContactPage.jsx
│   │   └── BlogPage.jsx
│   ├── services/       # API services
│   │   └── api.js
│   ├── store/          # Zustand stores
│   │   └── cartStore.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Cài đặt

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

## Cấu hình API

Tạo file `.env` trong thư mục `frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

Frontend kết nối với các endpoints sau từ .NET API:

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/products` | Lấy danh sách sản phẩm |
| GET | `/api/products/{id}` | Lấy chi tiết sản phẩm |
| GET | `/api/products?category={cat}` | Lọc theo danh mục |
| POST | `/api/orders` | Tạo đơn hàng |

## Tính năng

- **Trang chủ**: Hero banner, danh mục, sản phẩm nổi bật
- **Danh sách sản phẩm**: Filter, sort, phân trang
- **Chi tiết sản phẩm**: Hình ảnh, biến thể, thêm vào giỏ
- **Giỏ hàng**: Quản lý sản phẩm, tính tổng, checkout
- **Trang tĩnh**: Giới thiệu, Liên hệ, Blog

## Build cho Production

```bash
npm run build
npm run preview
```

Build output sẽ nằm trong thư mục `dist/`
