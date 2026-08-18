# Hướng dẫn Deploy Florist Vietnam

Dự án có 3 phần cần deploy:
1. **Frontend** (React + Vite) - Static files
2. **Backend** (.NET 8 API) - Web server
3. **Database** (MongoDB) - NoSQL database

---

## Phương án 1: Deploy miễn phí / rẻ nhất (Khuyến nghị cho MVP)

### Chi phí: $0 - $15/tháng

### Stack:
- **MongoDB Atlas** (Free tier M0) - Database
- **Railway.app** hoặc **Render.com** - Backend .NET
- **Vercel** hoặc **Netlify** - Frontend React

### Bước 1: Setup MongoDB Atlas (5 phút)

1. Đăng ký tại [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster M0 (Free) - chọn region gần Việt Nam (Singapore)
3. Tạo database user (username/password)
4. Whitelist IP: `0.0.0.0/0` (cho phép từ mọi nơi)
5. Click "Connect" → "Drivers" → Copy connection string

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecommer?retryWrites=true&w=majority
```

### Bước 2: Deploy Backend lên Railway (10 phút)

1. Push code lên GitHub (xem cuối file)
2. Đăng ký [railway.app](https://railway.app) bằng GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Chọn repo, chọn thư mục `api`
5. Railway tự động detect Dockerfile
6. Vào tab "Variables", thêm:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ConnectionStrings__MongoDB=<paste connection string từ Atlas>
   DatabaseName=ecommer
   ```
7. Vào tab "Settings" → "Generate Domain" → Copy URL (vd: `https://florist-api.up.railway.app`)

### Bước 3: Deploy Frontend lên Vercel (5 phút)

1. Đăng ký [vercel.com](https://vercel.com) bằng GitHub
2. Click "New Project" → Import repo
3. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Environment Variables**: Thêm `VITE_API_URL=https://florist-api.up.railway.app/api`
4. Click "Deploy" → đợi 2-3 phút
5. Copy URL frontend (vd: `https://florist.vn.vercel.app`)

### Bước 4: Cập nhật CORS

Sửa file `api/Program.cs`:
```csharp
policy.WithOrigins(
    "https://florist.vn.vercel.app",  // ← thêm URL frontend
    "http://localhost:5173"
)
```
Commit & push, Railway tự động redeploy.

---

## Phương án 2: Self-hosting (VPS) - Khuyến nghị cho production thực sự

### Chi phí: $5-20/tháng (VPS)

### Stack:
- **VPS**: DigitalOcean, AWS Lightsail, Vultr
- **Docker + Docker Compose** (đã cấu hình sẵn)
- **Nginx** (reverse proxy)
- **Certbot** (SSL miễn phí)
- **MongoDB** (chạy trong Docker)

### Bước 1: Mua VPS

Khu vực khuyến nghị: Singapore (gần Việt Nam)
- DigitalOcean: $6/tháng (1GB RAM)
- Vultr: $5/tháng (1GB RAM)

### Bước 2: Setup VPS

```bash
# SSH vào VPS
ssh root@your-vps-ip

# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Cài Docker Compose
apt install docker-compose -y

# Clone code
git clone https://github.com/your-user/florist.git
cd florist

# Tạo .env với các biến production
cp .env.example .env
nano .env  # điền thông tin
```

### Bước 3: Cấu hình .env

```bash
MONGO_ROOT_USER=florist_prod
MONGO_ROOT_PASSWORD=random-strong-password-here
MONGO_DB=ecommer
MONGO_EXPRESS_USER=admin
MONGO_EXPRESS_PASSWORD=another-strong-password
```

### Bước 4: Cài SSL miễn phí (Let's Encrypt)

```bash
# Cài Certbot
apt install certbot python3-certbot-nginx -y

# Lấy cert (cần nginx standalone trước)
certbot certonly --standalone -d florist.vn -d www.florist.vn

# Cert được lưu tại /etc/letsencrypt/live/florist.vn/
```

### Bước 5: Sửa nginx.conf để dùng HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name florist.vn www.florist.vn;

    ssl_certificate /etc/letsencrypt/live/florist.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/florist.vn/privkey.pem;

    # ... phần location giữ nguyên
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name florist.vn www.florist.vn;
    return 301 https://$host$request_uri;
}
```

### Bước 6: Trỏ domain về VPS

Tại nhà cung cấp domain (Namecheap, GoDaddy, VNPT...):
```
A Record: @ → your-vps-ip
A Record: www → your-vps-ip
```

### Bước 7: Khởi động

```bash
docker-compose up -d
```

### Bước 8: Auto-renew SSL + Backup

```bash
# Auto-renew cert (chạy mỗi 2 tháng)
crontab -e
0 3 1 */2 * certbot renew --quiet && docker-compose restart nginx

# Backup MongoDB hàng ngày
0 2 * * * docker exec ecommer-mongo mongodump --out /backup/$(date +\%Y\%m\%d)
```

---

## Phương án 3: Cloud Provider (AWS / GCP / Azure)

### Phù hợp với: Quy mô lớn, cần scale

- **AWS**: ECS Fargate + RDS DocumentDB + CloudFront + S3
- **GCP**: Cloud Run + MongoDB Atlas + Cloud CDN
- **Azure**: App Service + CosmosDB + Front Door

Chi phí: $50-200+/tháng. Phức tạp hơn, cần DevOps chuyên nghiệp.

---

## Bước quan trọng: Push code lên GitHub

```bash
# Tạo repo trên github.com

# Trong thư mục project
cd D:\WorkSpace\Ecommerce

# Khởi tạo git (nếu chưa)
git init
git add .
git commit -m "Initial commit - Florist Vietnam"

# Kết nối với GitHub
git remote add origin https://github.com/your-user/florist.git
git branch -M main
git push -u origin main
```

**Lưu ý**: File `.env` chứa thông tin nhạy cảm - KHÔNG push lên GitHub. Đã có `.gitignore` để bảo vệ.

---

## Checklist trước khi deploy

- [ ] Đổi tất cả passwords mặc định (`admin123`)
- [ ] Cấu hình CORS đúng domain production
- [ ] Bật HTTPS/SSL
- [ ] Set `ASPNETCORE_ENVIRONMENT=Production`
- [ ] Whitelist IP cho MongoDB (chỉ IP server)
- [ ] Backup database tự động
- [ ] Monitoring & logging (Sentry, Logtail, Datadog)
- [ ] Domain trỏ về đúng server
- [ ] Test đầy đủ luồng: đăng ký → mua hàng → thanh toán
- [ ] Tối ưu ảnh sản phẩm (WebP, lazy load)

---

## Monitoring & Maintenance

### Logs
```bash
# Xem logs backend
docker-compose logs -f api

# Xem logs frontend
docker-compose logs -f frontend

# Xem logs nginx
docker-compose logs -f nginx
```

### Update code
```bash
# Pull code mới
git pull

# Rebuild và restart
docker-compose up -d --build
```

### Scale khi cần
```bash
# Chạy nhiều instance backend
docker-compose up -d --scale api=3
```

---

## Liên hệ hỗ trợ

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Docker Docs**: https://docs.docker.com
