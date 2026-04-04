# Hướng dẫn Cài đặt và Sử dụng PM2 cho Dự án POS Sumi Mart

PM2 là một trình quản lý quy trình (Process Manager) cho các ứng dụng Node.js, giúp ứng dụng của bạn luôn chạy ngầm, tự động khởi động lại khi gặp lỗi và tự chạy khi máy chủ khởi động lại.

---

## 1. Yêu cầu hệ thống
- Đã cài đặt **Node.js** (phiên bản 18 trở lên).
- Đã cài đặt **Git** (nếu bạn tải code từ GitHub).

## 2. Cài đặt PM2
Mở terminal (hoặc SSH vào server) và chạy lệnh sau để cài đặt PM2 toàn cục:

```bash
npm install pm2 -g
```

Kiểm tra cài đặt thành công:
```bash
pm2 -v
```

## 3. Cấu hình cho Dự án
Vì dự án này sử dụng TypeScript (`server.ts`) và thư viện `tsx` để chạy, chúng ta sẽ tạo một file cấu hình để PM2 quản lý tốt nhất.

Tạo file `ecosystem.config.cjs` tại thư mục gốc của dự án:

```javascript
module.exports = {
  apps: [
    {
      name: "sumi-mart-pos",
      script: "server.ts",
      // Sử dụng tsx để thực thi file TypeScript trực tiếp
      interpreter: "node",
      interpreter_args: "--import tsx",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
}
```

## 4. Các lệnh vận hành cơ bản

### Khởi chạy ứng dụng
```bash
pm2 start ecosystem.config.cjs
```

### Xem danh sách các ứng dụng đang chạy
```bash
pm2 list
```

### Xem nhật ký (Logs) thời gian thực
Dùng để kiểm tra lỗi nếu web không truy cập được:
```bash
pm2 logs sumi-mart-pos
```

### Dừng / Khởi động lại / Xóa ứng dụng
```bash
pm2 stop sumi-mart-pos     # Dừng tạm thời
pm2 restart sumi-mart-pos  # Khởi động lại (áp dụng sau khi sửa code)
pm2 delete sumi-mart-pos   # Xóa khỏi danh sách quản lý của PM2
```

---

## 5. Thiết lập Tự động chạy khi Server khởi động lại (Startup)
Để đảm bảo ứng dụng tự chạy lại sau khi máy chủ (VPS) bị reboot:

1. Chạy lệnh tạo script startup:
   ```bash
   npm install -g pm2-windows-startup
   ```
   ```bash
   pm2-startup install
   ```
2. Terminal sẽ hiển thị một dòng lệnh (bắt đầu bằng `sudo env PATH...`). Hãy **Copy** dòng đó, **Paste** lại vào terminal và nhấn **Enter**.
3. Lưu trạng thái hiện tại để PM2 nhớ ứng dụng cần chạy:
   ```bash
   pm2 save
   ```

---

## 6. Mẹo cho Host Miễn phí (Render/Railway)
Nếu bạn dùng host miễn phí và bị tình trạng web "ngủ" (Sleep) sau 15 phút:
1. Truy cập [UptimeRobot.com](https://uptimerobot.com/) (miễn phí).
2. Tạo một **Monitor** mới loại **HTTP(s)**.
3. Nhập URL trang web của bạn.
4. Thiết lập kiểm tra mỗi **5 phút**.
*Việc này sẽ giữ cho server luôn thức và không bị tắt.*

---

## 7. Cập nhật Code mới
Mỗi khi bạn `git pull` hoặc sửa code trên server, hãy chạy lệnh sau để cập nhật ứng dụng:
```bash
pm2 restart sumi-mart-pos
```
