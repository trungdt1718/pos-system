import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Mock Data ---
  let products = [
    { id: "HH001", name: "Sữa tươi TH True Milk 1L", category: "Thực phẩm", unit: "Hộp", price: 32500, stock: 452, manufacturer: "TH True Milk", origin: "Việt Nam", supplier: "Công ty CP Chuỗi Thực phẩm TH" },
    { id: "HH002", name: "Gạo ST25 Túi 5kg", category: "Thực phẩm", unit: "Túi", price: 185000, stock: 215, manufacturer: "ST25", origin: "Việt Nam", supplier: "Đại lý Gạo sạch" },
    { id: "HH003", name: "Nước rửa chén Sunlight 750ml", category: "Gia dụng", unit: "Chai", price: 42000, stock: 128, manufacturer: "Unilever", origin: "Việt Nam", supplier: "Unilever VN" },
  ];

  let customers = [
    { id: "KH-00234", name: "Nguyễn Văn An", gender: "Nam", birthday: "1992-05-12", phone: "0901234567", email: "an.nv@gmail.com", address: "123 Lê Lợi, Quận 1, TP.HCM", totalSpent: 12500000 },
    { id: "KH-00235", name: "Lê Thị Mai", gender: "Nữ", birthday: "1995-09-28", phone: "0905123456", email: "lemai.sumi@gmail.com", address: "123 Đường Lê Lợi, Phường 4, Quận Gò Vấp, TP. Hồ Chí Minh", totalSpent: 45230000 },
  ];

  let staff = [
    { id: "NV001", name: "Nguyễn Văn An", gender: "Nam", username: "an.nv", status: "Đang làm việc", role: "Nhân viên bán hàng", phone: "0901234567", email: "an.nv@sumimart.vn" },
    { id: "NV002", name: "Trần Thị Bình", gender: "Nữ", username: "binh.tt", status: "Đang làm việc", role: "Nhân viên bán hàng", phone: "0901234568", email: "binh.tt@sumimart.vn" },
    { id: "NV003", name: "Lê Hoàng Nam", gender: "Nam", username: "nam.lh", status: "Đang làm việc", role: "Quản lý kho", phone: "0901234569", email: "nam.lh@sumimart.vn" },
  ];

  let invoices = [
    { id: "ORD-2841", customerName: "Nguyễn Văn Hùng", products: "Gạo ST25, Nước mắm Nam Ngư...", time: "10:45 AM", total: 1250000, status: "Hoàn tất" },
    { id: "ORD-2840", customerName: "Trần Thị Lan", products: "Bột giặt Omo, Dầu ăn Tường An", time: "10:32 AM", total: 450000, status: "Hoàn tất" },
  ];

  // --- API Routes ---

  // Products
  app.get("/api/products", (req, res) => res.json(products));
  app.post("/api/products", (req, res) => {
    const newProduct = { ...req.body, id: `HH${String(products.length + 1).padStart(3, '0')}` };
    products.push(newProduct);
    res.status(201).json(newProduct);
  });
  app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    products = products.map(p => p.id === id ? { ...p, ...req.body } : p);
    res.json(products.find(p => p.id === id));
  });
  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    products = products.filter(p => p.id !== id);
    res.status(204).send();
  });

  // Customers
  app.get("/api/customers", (req, res) => res.json(customers));
  app.post("/api/customers", (req, res) => {
    const newCustomer = { ...req.body, id: `KH-${String(customers.length + 234).padStart(5, '0')}` };
    customers.push(newCustomer);
    res.status(201).json(newCustomer);
  });
  app.put("/api/customers/:id", (req, res) => {
    const { id } = req.params;
    customers = customers.map(c => c.id === id ? { ...c, ...req.body } : c);
    res.json(customers.find(c => c.id === id));
  });
  app.delete("/api/customers/:id", (req, res) => {
    const { id } = req.params;
    customers = customers.filter(c => c.id !== id);
    res.status(204).send();
  });

  // Staff
  app.get("/api/staff", (req, res) => res.json(staff));
  app.post("/api/staff", (req, res) => {
    const newStaff = { ...req.body, id: `NV${String(staff.length + 1).padStart(3, '0')}` };
    staff.push(newStaff);
    res.status(201).json(newStaff);
  });
  app.put("/api/staff/:id", (req, res) => {
    const { id } = req.params;
    staff = staff.map(s => s.id === id ? { ...s, ...req.body } : s);
    res.json(staff.find(s => s.id === id));
  });
  app.delete("/api/staff/:id", (req, res) => {
    const { id } = req.params;
    staff = staff.filter(s => s.id !== id);
    res.status(204).send();
  });

  // Invoices
  app.get("/api/invoices", (req, res) => res.json(invoices));
  app.post("/api/invoices", (req, res) => {
    const newInvoice = { ...req.body, id: `ORD-${String(invoices.length + 2842).padStart(4, '0')}` };
    invoices.push(newInvoice);
    res.status(201).json(newInvoice);
  });

  app.delete("/api/invoices/:id", (req, res) => {
    const { id } = req.params;
    invoices = invoices.filter(i => i.id !== id);
    res.status(204).send();
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
