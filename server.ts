import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Mock Data for In-Memory Fallback ---
let mockProducts: any[] = [
  { id: "HH001", name: "Sữa tươi Vinamilk 1L", category: "Sữa & Chế phẩm", unit: "Hộp", price: 32000, stock: 150, batch: "L01", expiry: "2026-12-01", manufacturer: "Vinamilk", origin: "Việt Nam", supplier: "Vinamilk" },
  { id: "HH002", name: "Gạo ST25 5kg", category: "Lương thực", unit: "Túi", price: 185000, stock: 45, batch: "G05", expiry: "2027-01-15", manufacturer: "Sóc Trăng", origin: "Việt Nam", supplier: "Đại lý Gạo" },
  { id: "HH003", name: "Dầu ăn Tường An 1L", category: "Gia vị", unit: "Chai", price: 45000, stock: 80, batch: "D12", expiry: "2026-10-20", manufacturer: "Tường An", origin: "Việt Nam", supplier: "Tường An" }
];

let mockCustomers: any[] = [
  { id: "KH001", name: "Nguyễn Văn A", phone: "0901234567", address: "123 Lê Lợi, Q.1, TP.HCM", type: "Thành viên", points: 150, totalSpent: 5000000 },
  { id: "KH002", name: "Trần Thị B", phone: "0987654321", address: "456 Nguyễn Huệ, Q.1, TP.HCM", type: "VIP", points: 1200, totalSpent: 25000000 }
];

let mockStaff: any[] = [
  { id: "NV001", name: "Lê Văn C", role: "Quản lý", phone: "0912345678", email: "levanc@sumimart.vn", status: "Đang làm việc", joinDate: "2024-01-10" },
  { id: "NV002", name: "Phạm Thị D", role: "Thu ngân", phone: "0934567890", email: "phamthid@sumimart.vn", status: "Đang làm việc", joinDate: "2024-03-15" }
];

let mockInvoices: any[] = [];
let mockSettings = { tendv: "Sumi.Mart Demo", diachi: "123 Demo Street", dienthoai: "0123456789" };

// PostgreSQL Connection
let dbConnected = false;
let currentConnectionString = process.env.DATABASE_URL;

let pool = new Pool({
  connectionString: currentConnectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Hàm khởi tạo/thay đổi kết nối
async function initializePool(connStr: string | undefined) {
  if (!connStr) {
    dbConnected = false;
    return;
  }

  const newPool = new Pool({
    connectionString: connStr,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await newPool.connect();
    console.log('✅ KẾT NỐI DATABASE MỚI THÀNH CÔNG!');
    
    // Đóng pool cũ nếu có
    if (pool) await pool.end();
    
    pool = newPool;
    currentConnectionString = connStr;
    dbConnected = true;
    client.release();
    return true;
  } catch (err: any) {
    console.error('❌ LỖI KẾT NỐI DATABASE MỚI:', err.message);
    dbConnected = false;
    return false;
  }
}

// Khởi tạo lần đầu
initializePool(currentConnectionString);

// Helper for SQL queries - use the current pool
const query = (text: string, params?: any[]) => pool.query(text, params);

// Database Initialization
async function initDb() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS dmphanloai (
        mapl VARCHAR(20) NOT NULL PRIMARY KEY,
        tenpl VARCHAR(255)
      );
      CREATE TABLE IF NOT EXISTS dmdvt (
        madvt VARCHAR(20) NOT NULL PRIMARY KEY,
        tendvt VARCHAR(50)
      );
      CREATE TABLE IF NOT EXISTS dmnuocsx (
        manuocsx VARCHAR(20) NOT NULL PRIMARY KEY,
        tennuocsx VARCHAR(255)
      );
      CREATE TABLE IF NOT EXISTS dmnhacc (
        mancc VARCHAR(20) NOT NULL PRIMARY KEY,
        tenncc VARCHAR(255),
        daidien VARCHAR(255),
        diachi VARCHAR(255),
        dienthoai VARCHAR(20),
        email VARCHAR(255),
        mst VARCHAR(255)
      );
      CREATE TABLE IF NOT EXISTS dmhanghoa (
        mahh VARCHAR(20) NOT NULL PRIMARY KEY,
        tenhh VARCHAR(255),
        madvt VARCHAR(20) REFERENCES dmdvt(madvt) ON UPDATE CASCADE,
        mapl VARCHAR(20) REFERENCES dmphanloai(mapl) ON UPDATE CASCADE,
        nhasx VARCHAR(255),
        manuocsx VARCHAR(20) REFERENCES dmnuocsx(manuocsx) ON UPDATE CASCADE,
        mancc VARCHAR(20) REFERENCES dmnhacc(mancc) ON UPDATE CASCADE,
        sudung NUMERIC(1,0),
        giabantt NUMERIC(20,3)
      );
      CREATE TABLE IF NOT EXISTS dmkh (
        makh VARCHAR(20) NOT NULL PRIMARY KEY,
        hoten VARCHAR(255),
        gioitinh NUMERIC(1,0),
        ngaysinh TIMESTAMP,
        namsinh VARCHAR(4),
        diachi VARCHAR(255),
        dienthoai VARCHAR(20),
        email VARCHAR(255),
        tongtien NUMERIC(25,2)
      );
      CREATE TABLE IF NOT EXISTS dmloainv (
        maloainv VARCHAR(20) NOT NULL PRIMARY KEY,
        tenloainv VARCHAR(255)
      );
      CREATE TABLE IF NOT EXISTS dmnhanvien (
        manv VARCHAR(20) NOT NULL PRIMARY KEY,
        hoten VARCHAR(255),
        gioitinh NUMERIC(1,0),
        taikhoan VARCHAR(20) UNIQUE,
        matkhau VARCHAR(255),
        diachi VARCHAR(255),
        mobile VARCHAR(20),
        phone VARCHAR(20),
        email VARCHAR(50),
        tinhtrang NUMERIC(1,0),
        maloainv VARCHAR(20) REFERENCES dmloainv(maloainv) ON UPDATE CASCADE
      );
      CREATE TABLE IF NOT EXISTS hoadon (
        sohd VARCHAR(20) NOT NULL,
        ngayhd TIMESTAMP,
        ngaylap TIMESTAMP,
        makh VARCHAR(20) REFERENCES dmkh(makh),
        thanhtienban NUMERIC(25,2),
        loaixn VARCHAR(5) NOT NULL,
        taikhoan VARCHAR(20),
        PRIMARY KEY (sohd, loaixn)
      );
      CREATE TABLE IF NOT EXISTS pshdxn (
        sohd VARCHAR(20),
        mahh VARCHAR(20) REFERENCES dmhanghoa(mahh) ON UPDATE CASCADE,
        soluong NUMERIC(14,1),
        giaban NUMERIC(20,3),
        dongia NUMERIC(20,3),
        thanhtienban NUMERIC(25,2),
        thanhtienvon NUMERIC(25,2),
        giavon NUMERIC(20,3),
        loaixn VARCHAR(5),
        stt NUMERIC(3,0),
        madvt VARCHAR(20)
      );
      CREATE TABLE IF NOT EXISTS pstonkho (
        mahh VARCHAR(20) REFERENCES dmhanghoa(mahh) ON UPDATE CASCADE,
        ton NUMERIC(14,1),
        giaban NUMERIC(20,3),
        giavon NUMERIC(20,3),
        solo VARCHAR(20),
        handung VARCHAR(20)
      );
      CREATE TABLE IF NOT EXISTS hethong (
        id NUMERIC(25,3) NOT NULL PRIMARY KEY,
        tents VARCHAR(20),
        giatri VARCHAR(500),
        diengiai VARCHAR
      );
    `);
    console.log('✅ DATABASE INITIALIZED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ DATABASE INITIALIZATION FAILED:', err);
  }
}

// Helper to get or create ID for classification/unit
const getOrCreateRefId = async (table: string, idCol: string, nameCol: string, name: string, prefix: string) => {
  if (!name) return null;
  const existing = await query(`SELECT ${idCol} FROM ${table} WHERE ${nameCol} = $1`, [name]);
  if (existing.rows.length > 0) return existing.rows[0][idCol];
  
  const newId = `${prefix}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  await query(`INSERT INTO ${table} (${idCol}, ${nameCol}) VALUES ($1, $2)`, [newId, name]);
  return newId;
};

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes with PostgreSQL ---

  // Database Status Check
  app.get("/api/db-status", (req, res) => {
    res.json({ 
      source: dbConnected ? "PostgreSQL Database" : "In-Memory (Fallback/Error)",
      connected: dbConnected,
      connectionString: currentConnectionString ? `${currentConnectionString.substring(0, 15)}...` : "Chưa cấu hình",
      timestamp: new Date().toISOString()
    });
  });

  // Update Database Config
  app.post("/api/db-config", async (req, res) => {
    const { connectionString } = req.body;
    if (!connectionString) {
      return res.status(400).json({ message: "Thiếu chuỗi kết nối (connectionString)" });
    }

    const success = await initializePool(connectionString);
    if (success) {
      res.json({ message: "Cập nhật kết nối thành công!", connected: true });
    } else {
      res.status(500).json({ message: "Kết nối thất bại. Vui lòng kiểm tra lại chuỗi kết nối.", connected: false });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    if (!dbConnected) {
      return res.json(mockProducts);
    }
    try {
      const result = await query(`
        SELECT h.*, t.ton, t.solo, t.handung, pl.tenpl as nhomhh, dvt.tendvt as dvt, n.tennuocsx as tennuocsx, nc.tenncc as tenncc
        FROM dmhanghoa h
        LEFT JOIN pstonkho t ON h.mahh = t.mahh
        LEFT JOIN dmphanloai pl ON h.mapl = pl.mapl
        LEFT JOIN dmdvt dvt ON h.madvt = dvt.madvt
        LEFT JOIN dmnuocsx n ON h.manuocsx = n.manuocsx
        LEFT JOIN dmnhacc nc ON h.mancc = nc.mancc
        ORDER BY h.tenhh ASC
      `);
      const mapped = result.rows.map(p => ({
        id: p.mahh,
        name: p.tenhh,
        category: p.nhomhh || p.mapl,
        unit: p.dvt || p.madvt,
        price: parseFloat(p.giabantt) || 0,
        stock: parseFloat(p.ton) || 0,
        batch: p.solo,
        expiry: p.handung,
        manufacturer: p.nhasx,
        origin: p.tennuocsx || p.manuocsx,
        supplier: p.tenncc || p.mancc
      }));
      res.json(mapped);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/products", async (req, res) => {
    if (!dbConnected) {
      const newProduct = { id: `HH${Date.now().toString().slice(-6)}`, ...req.body };
      mockProducts.push(newProduct);
      return res.status(201).json(newProduct);
    }
    const { name, price, stock, category, unit, manufacturer, origin, supplier } = req.body;
    try {
      const mapl = await getOrCreateRefId('dmphanloai', 'mapl', 'tenpl', category, 'PL');
      const madvt = await getOrCreateRefId('dmdvt', 'madvt', 'tendvt', unit, 'DV');
      const manuocsx = await getOrCreateRefId('dmnuocsx', 'manuocsx', 'tennuocsx', origin, 'NSX');
      const mancc = await getOrCreateRefId('dmnhacc', 'mancc', 'tenncc', supplier, 'NCC');
      
      const mahh = `HH${Date.now().toString().slice(-6)}`;
      await query(
        "INSERT INTO dmhanghoa (mahh, tenhh, giabantt, mapl, madvt, nhasx, manuocsx, mancc, sudung) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)",
        [mahh, name, price, mapl, madvt, manufacturer, manuocsx, mancc]
      );
      
      // Check if pstonkho has unique constraint, if not use manual check
      const existingStock = await query("SELECT mahh FROM pstonkho WHERE mahh = $1", [mahh]);
      if (existingStock.rows.length > 0) {
        await query("UPDATE pstonkho SET ton = $1, giaban = $2 WHERE mahh = $3", [stock || 0, price, mahh]);
      } else {
        await query("INSERT INTO pstonkho (mahh, ton, giaban) VALUES ($1, $2, $3)", [mahh, stock || 0, price]);
      }
      
      res.status(201).json({ id: mahh, ...req.body });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) {
      const index = mockProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProducts[index] = { ...mockProducts[index], ...req.body };
        return res.json(mockProducts[index]);
      }
      return res.status(404).json({ error: "Product not found" });
    }
    const { name, price, stock, category, unit, manufacturer, origin, supplier } = req.body;
    try {
      const mapl = await getOrCreateRefId('dmphanloai', 'mapl', 'tenpl', category, 'PL');
      const madvt = await getOrCreateRefId('dmdvt', 'madvt', 'tendvt', unit, 'DV');
      const manuocsx = await getOrCreateRefId('dmnuocsx', 'manuocsx', 'tennuocsx', origin, 'NSX');
      const mancc = await getOrCreateRefId('dmnhacc', 'mancc', 'tenncc', supplier, 'NCC');

      await query(
        "UPDATE dmhanghoa SET tenhh = $1, giabantt = $2, mapl = $3, madvt = $4, nhasx = $5, manuocsx = $6, mancc = $7 WHERE mahh = $8",
        [name, price, mapl, madvt, manufacturer, manuocsx, mancc, id]
      );

      if (stock !== undefined) {
        const existingStock = await query("SELECT mahh FROM pstonkho WHERE mahh = $1", [id]);
        if (existingStock.rows.length > 0) {
          await query("UPDATE pstonkho SET ton = $1, giaban = $2 WHERE mahh = $3", [stock, price, id]);
        } else {
          await query("INSERT INTO pstonkho (mahh, ton, giaban) VALUES ($1, $2, $3)", [id, stock, price]);
        }
      }

      res.json({ id, ...req.body });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) {
      mockProducts = mockProducts.filter(p => p.id !== id);
      return res.json({ success: true });
    }
    try {
      await query("DELETE FROM pstonkho WHERE mahh = $1", [id]);
      await query("DELETE FROM dmhanghoa WHERE mahh = $1", [id]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    if (!dbConnected) {
      return res.json(mockCustomers);
    }
    try {
      const result = await query("SELECT * FROM dmkh ORDER BY hoten ASC");
      const mapped = result.rows.map(c => ({
        id: c.makh,
        name: c.hoten,
        gender: parseInt(c.gioitinh) === 1 ? "Nam" : "Nữ",
        birthday: c.ngaysinh,
        phone: c.dienthoai,
        email: c.email,
        address: c.diachi,
        totalSpent: parseFloat(c.tongtien) || 0
      }));
      res.json(mapped);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    if (!dbConnected) {
      const newCustomer = { id: `KH${Date.now().toString().slice(-6)}`, ...req.body, totalSpent: 0 };
      mockCustomers.push(newCustomer);
      return res.status(201).json(newCustomer);
    }
    const { name, gender, birthday, phone, email, address } = req.body;
    try {
      const makh = `KH${Date.now().toString().slice(-6)}`;
      const gioitinh = gender === "Nam" ? 1 : 0;
      const namsinh = birthday ? new Date(birthday).getFullYear().toString() : null;
      await query(
        "INSERT INTO dmkh (makh, hoten, gioitinh, ngaysinh, namsinh, dienthoai, email, diachi) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [makh, name, gioitinh, birthday, namsinh, phone, email, address]
      );
      res.status(201).json({ id: makh, ...req.body });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) {
      const index = mockCustomers.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCustomers[index] = { ...mockCustomers[index], ...req.body };
        return res.json(mockCustomers[index]);
      }
      return res.status(404).json({ error: "Customer not found" });
    }
    const { name, gender, birthday, phone, email, address } = req.body;
    try {
      const gioitinh = gender === "Nam" ? 1 : 0;
      const namsinh = birthday ? new Date(birthday).getFullYear().toString() : null;
      await query(
        "UPDATE dmkh SET hoten = $1, gioitinh = $2, ngaysinh = $3, namsinh = $4, dienthoai = $5, email = $6, diachi = $7 WHERE makh = $8",
        [name, gioitinh, birthday, namsinh, phone, email, address, id]
      );
      res.json({ id, ...req.body });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) {
      mockCustomers = mockCustomers.filter(c => c.id !== id);
      return res.json({ success: true });
    }
    try {
      await query("DELETE FROM dmkh WHERE makh = $1", [id]);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Staff
  app.get("/api/staff", async (req, res) => {
    if (!dbConnected) {
      return res.json(mockStaff);
    }
    try {
      const result = await query(`
        SELECT s.*, l.tenloainv 
        FROM dmnhanvien s
        LEFT JOIN dmloainv l ON s.maloainv = l.maloainv
        ORDER BY s.hoten ASC
      `);
      const mapped = result.rows.map(s => ({
        id: s.manv,
        name: s.hoten,
        gender: parseInt(s.gioitinh) === 1 ? "Nam" : "Nữ",
        username: s.taikhoan,
        status: parseInt(s.tinhtrang) === 1 ? "Đang làm việc" : "Nghỉ việc",
        role: s.tenloainv || (s.maloainv === "QT" ? "Quản trị viên" : "Nhân viên"),
        phone: s.mobile || s.phone,
        email: s.email
      }));
      res.json(mapped);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    if (!dbConnected) {
      const newStaff = { id: `NV${Date.now().toString().slice(-6)}`, ...req.body, status: "Đang làm việc", joinDate: new Date().toISOString().split('T')[0] };
      mockStaff.push(newStaff);
      return res.status(201).json(newStaff);
    }
    const { name, username, password, role, phone, email, gender } = req.body;
    try {
      const manv = `NV${Date.now().toString().slice(-6)}`;
      const maloainv = role === "Quản trị viên" || role === "Quản trị hệ thống" ? "QT" : "NV";
      const gioitinh = gender === "Nam" ? 1 : 0;
      
      // Ensure role exists with the specific code
      const existingRole = await query("SELECT maloainv FROM dmloainv WHERE maloainv = $1", [maloainv]);
      if (existingRole.rows.length === 0) {
        await query("INSERT INTO dmloainv (maloainv, tenloainv) VALUES ($1, $2)", [maloainv, role]);
      }
      
      await query(
        "INSERT INTO dmnhanvien (manv, hoten, taikhoan, matkhau, maloainv, mobile, email, tinhtrang, gioitinh) VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8)",
        [manv, name, username, password || '', maloainv, phone, email, gioitinh]
      );
      res.status(201).json({ id: manv, ...req.body });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.put("/api/staff/:id", async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) {
      const index = mockStaff.findIndex(s => s.id === id);
      if (index !== -1) {
        mockStaff[index] = { ...mockStaff[index], ...req.body };
        return res.json(mockStaff[index]);
      }
      return res.status(404).json({ error: "Staff not found" });
    }
    const { name, username, password, role, phone, email, status, gender } = req.body;
    try {
      const maloainv = role === "Quản trị viên" || role === "Quản trị hệ thống" ? "QT" : "NV";
      const tinhtrang = status === "Đang làm việc" ? 1 : 0;
      const gioitinh = gender === "Nam" ? 1 : 0;
      
      // Ensure role exists with the specific code
      const existingRole = await query("SELECT maloainv FROM dmloainv WHERE maloainv = $1", [maloainv]);
      if (existingRole.rows.length === 0) {
        await query("INSERT INTO dmloainv (maloainv, tenloainv) VALUES ($1, $2)", [maloainv, role]);
      }
      
      let sql = "UPDATE dmnhanvien SET hoten = $1, taikhoan = $2, maloainv = $3, mobile = $4, email = $5, tinhtrang = $6, gioitinh = $7";
      const params = [name, username, maloainv, phone, email, tinhtrang, gioitinh];
      
      if (password) {
        sql += ", matkhau = $8 WHERE manv = $9";
        params.push(password, id);
      } else {
        sql += " WHERE manv = $8";
        params.push(id);
      }
      
      await query(sql, params);
      res.json({ id, ...req.body });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) {
      mockStaff = mockStaff.filter(s => s.id !== id);
      return res.json({ success: true });
    }
    try {
      await query("DELETE FROM dmnhanvien WHERE manv = $1", [id]);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Invoices
  app.get("/api/invoices", async (req, res) => {
    if (!dbConnected) {
      return res.json(mockInvoices);
    }
    try {
      const result = await query(`
        SELECT i.*, c.hoten as customer_name,
        (SELECT string_agg(h.tenhh, ', ') FROM pshdxn d JOIN dmhanghoa h ON d.mahh = h.mahh WHERE d.sohd = i.sohd) as product_list
        FROM hoadon i
        LEFT JOIN dmkh c ON i.makh = c.makh
        WHERE i.loaixn = 'xk'
        ORDER BY i.ngayhd DESC
      `);
      const mapped = result.rows.map(i => ({
        id: i.sohd,
        customerName: i.customer_name || "Khách lẻ",
        products: i.product_list || "Không có dữ liệu",
        time: i.ngayhd,
        total: parseFloat(i.thanhtienban) || 0,
        status: "Hoàn tất"
      }));
      res.json(mapped);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    const { customerId, items, total } = req.body;
    if (!dbConnected) {
      const sohd = `HD${Date.now().toString().slice(-8)}`;
      const customer = mockCustomers.find(c => c.id === customerId);
      const newInvoice = {
        id: sohd,
        customerName: customer ? customer.name : "Khách lẻ",
        products: items.map((it: any) => it.name).join(", "),
        time: new Date().toISOString(),
        total: total,
        status: "Hoàn tất"
      };
      mockInvoices.unshift(newInvoice);
      
      // Update stock in memory
      items.forEach((item: any) => {
        const p = mockProducts.find(prod => prod.id === item.id);
        if (p) p.stock -= item.quantity;
      });

      // Update customer total spent in memory
      if (customer) {
        customer.totalSpent = (customer.totalSpent || 0) + total;
      }

      return res.status(201).json({ id: sohd });
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const sohd = `HD${Date.now().toString().slice(-8)}`;
      const ngayhd = new Date();
      const makh = customerId && customerId !== 'KL' ? customerId : '000001';
      
      // 1. Insert into hoadon
      await client.query(
        "INSERT INTO hoadon (sohd, ngayhd, ngaylap, makh, thanhtienban, loaixn, taikhoan) VALUES ($1, $2, $2, $3, $4, 'xk', 'admin')",
        [sohd, ngayhd, makh, total]
      );

      // 2. Insert into pshdxn (details) and update stock
      if (items && Array.isArray(items)) {
        let stt = 1;
        for (const item of items) {
          // Fetch giavon and madvt from database to be accurate
          const productInfo = await client.query(
            "SELECT h.madvt, t.giavon FROM dmhanghoa h LEFT JOIN pstonkho t ON h.mahh = t.mahh WHERE h.mahh = $1",
            [item.id]
          );
          const giavon = productInfo.rows[0]?.giavon || 0;
          const madvt = productInfo.rows[0]?.madvt || '';
          const thanhtienban = item.quantity * item.price;
          const thanhtienvon = item.quantity * giavon;

          await client.query(
            "INSERT INTO pshdxn (sohd, mahh, soluong, giaban, dongia, thanhtienban, thanhtienvon, giavon, loaixn, stt, madvt) VALUES ($1, $2, $3, $4, $4, $5, $6, $7, 'xk', $8, $9)",
            [sohd, item.id, item.quantity, item.price, thanhtienban, thanhtienvon, giavon, stt++, madvt]
          );
          
          // Update stock
          await client.query(
            "UPDATE pstonkho SET ton = ton - $1 WHERE mahh = $2",
            [item.quantity, item.id]
          );
        }
      }

      // 3. Update customer total spent
      if (makh !== '000001') {
        await client.query(
          "UPDATE dmkh SET tongtien = COALESCE(tongtien, 0) + $1 WHERE makh = $2",
          [total, makh]
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ id: sohd });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: "Database error" });
    } finally {
      client.release();
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    const { id } = req.params;
    if (!dbConnected) {
      mockInvoices = mockInvoices.filter(i => i.id !== id);
      return res.json({ success: true });
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Get invoice details to restore stock and update customer total
      const details = await client.query("SELECT mahh, soluong, thanhtienban FROM pshdxn WHERE sohd = $1", [id]);
      const invoice = await client.query("SELECT makh, thanhtienban FROM hoadon WHERE sohd = $1", [id]);
      
      if (invoice.rows.length > 0) {
        const { makh, thanhtienban } = invoice.rows[0];
        
        // Restore stock
        for (const row of details.rows) {
          await client.query("UPDATE pstonkho SET ton = ton + $1 WHERE mahh = $2", [row.soluong, row.mahh]);
        }
        
        // Update customer total
        if (makh && makh !== '000001') {
          await client.query("UPDATE dmkh SET tongtien = GREATEST(0, COALESCE(tongtien, 0) - $1) WHERE makh = $2", [thanhtienban, makh]);
        }
      }

      // 2. Delete from pshdxn and hoadon
      await client.query("DELETE FROM pshdxn WHERE sohd = $1", [id]);
      await client.query("DELETE FROM hoadon WHERE sohd = $1", [id]);

      await client.query('COMMIT');
      res.status(204).send();
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: "Database error" });
    } finally {
      client.release();
    }
  });

  // System Settings
  app.get("/api/system/settings", async (req, res) => {
    if (!dbConnected) {
      return res.json(mockSettings);
    }
    try {
      const result = await query("SELECT tents, giatri FROM hethong");
      const settings: any = {};
      result.rows.forEach(row => {
        settings[row.tents] = row.giatri;
      });
      
      if (Object.keys(settings).length > 0) {
        res.json(settings);
      } else {
        res.json({
          tendv: "Quán Tám bánh mì bò kho",
          diachi: "114 Mậu Thân, Ninh Kiều, Cần Thơ",
          dienthoai: "0795986289",
          logo: ""
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();