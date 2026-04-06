# Hướng dẫn Cài đặt và Chạy Dự án POS Sumi Mart (PostgreSQL)

Dự án này sử dụng **React (Vite)** cho Frontend và **Express (Node.js)** cho Backend, kết nối với cơ sở dữ liệu **PostgreSQL**.

---

## 1. Thiết lập Cơ sở dữ liệu (Neon.tech hoặc Local)

### Cách 1: Sử dụng Neon.tech (Khuyên dùng)
1. Truy cập [neon.tech](https://neon.tech) và đăng ký tài khoản.
2. Tạo một Project mới (ví dụ: `sumi-mart-pos`).
3. Copy "Connection string" có dạng: `postgres://[user]:[password]@[host]/[dbname]?sslmode=require`.
4. Ứng dụng có tính năng **Auto-Init DB**, nên các bảng sẽ tự động được tạo khi bạn chạy ứng dụng lần đầu.

### Cách 2: Sử dụng PostgreSQL Local
1. Cài đặt PostgreSQL từ [postgresql.org](https://www.postgresql.org/download/).
2. Tạo database: `CREATE DATABASE sumi_mart_db;`.
3. (Tùy chọn) Chạy file `schema.sql` để khởi tạo cấu trúc bảng thủ công.

---

## 2. Cài đặt và Cấu hình

### Bước 1: Cài đặt thư viện (Dependencies)
Mở Terminal tại thư mục gốc của dự án và chạy:
```bash
npm install
```

### Bước 2: Cấu hình Biến môi trường
1. Tạo file `.env` tại thư mục gốc.
2. Copy nội dung từ `.env.example` vào `.env` và điền thông tin:
```env
VITE_API_URL=http://localhost:3000/api
DATABASE_URL=chuoi_ket_noi_cua_ban_o_day
```
*Lưu ý: Nếu dùng Neon, hãy nhớ thêm `?sslmode=require` vào cuối URL.*

---

## 3. Chạy Dự án

### Chế độ Phát triển (Development)
Lệnh này sẽ chạy cả Backend và Frontend:
```bash
npm run dev
```
Truy cập ứng dụng tại: [http://localhost:3000](http://localhost:3000)

---

## 4. Triển khai chuyên nghiệp với PM2 (Trên Windows)

PM2 giúp ứng dụng chạy ngầm và tự khởi động lại khi máy chủ reboot.

### Bước 1: Cài đặt PM2 và công cụ Startup
```bash
npm install pm2 -g
npm install -g pm2-windows-startup
```

### Bước 2: Build và Khởi chạy
```bash
npm run build
pm2 start ecosystem.config.cjs
```

### Bước 3: Thiết lập Tự khởi động cùng Windows (Quan trọng)
Trên Windows, PM2 cần được đăng ký thành một Service để tự chạy khi máy khởi động lại.

1. Mở **PowerShell** với quyền **Administrator**.
2. Cài đặt công cụ tạo Service:
```bash
npm install -g pm2-windows-service
```
3. Đăng ký Service:
```bash
pm2-service-install
```
*(Chọn **y** khi được hỏi về thiết lập môi trường).*

4. Khởi chạy ứng dụng và lưu trạng thái:
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

### Các lệnh PM2 hữu ích:
- `pm2 list`: Xem danh sách ứng dụng.
- `pm2 logs sumi-mart-pos`: Xem nhật ký lỗi.
- `pm2 restart sumi-mart-pos`: Khởi động lại sau khi sửa code.
- `pm2 stop sumi-mart-pos`: Dừng ứng dụng.

---

## 5. Triển khai trên Render (Cloud)

**Quan trọng về bảo mật:** KHÔNG đưa file `.env` lên GitHub.

1. Đưa code lên GitHub (file `.gitignore` đã chặn `.env`).
2. Trên Render Dashboard, chọn **Web Service** và kết nối với Repo.
3. Trong mục **Environment**, thêm các biến:
   - `DATABASE_URL`: Chuỗi kết nối Neon.
   - `NODE_ENV`: `production`
   - `VITE_API_URL`: `https://ten-app-cua-ban.onrender.com/api`

---

## 6. Khởi tạo Dữ liệu mẫu

Sau khi chạy project, bạn có thể nhấn nút **"KHỞI TẠO DỮ LIỆU MẪU"** ở góc trên bên phải màn hình POS để tự động thêm sản phẩm và khách hàng mẫu vào database.

---

Chúc bạn thành công!
