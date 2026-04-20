import React, { useState, useEffect } from "react";
import { Search, Bell, UserCircle, Store, PersonStanding, CreditCard, History, Tag, ShoppingCart, Printer, Plus, Minus, Trash2, Save, X, CheckCircle2, AlertCircle, ChevronRight, RefreshCcw, Scan } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion, AnimatePresence } from "motion/react";
import { formatCurrency, cn } from "../lib/utils";
import { productService, customerService, staffService, invoiceService, systemService } from "../services/api";
import { Product, Customer } from "../types";

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paid, setPaid] = useState(0);
  const [activeTab, setActiveTab] = useState("customer");
  const [invoiceId] = useState(`HD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scanner.render((decodedText) => {
        const product = products.find(p => p.id === decodedText);
        if (product) {
          addToCart(product);
          showNotification(`Đã thêm: ${product.name}`);
          setIsScanning(false);
          if (scanner) scanner.clear();
        } else {
          showNotification(`Không tìm thấy sản phẩm: ${decodedText}`, "error");
        }
      }, (error) => {
        // silence errors
      });
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Error clearing scanner", e));
      }
    };
  }, [isScanning, products]);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const customerSelectRef = React.useRef<HTMLSelectElement>(null);

  const seedData = async () => {
    try {
      const products = [
        { id: "HH-001", name: "Bánh mì bò kho", category: "Thức ăn", unit: "Tô", price: 35000, stock: 100, batch: "L01", expiry: "2026-12-31" },
        { id: "HH-002", name: "Hủ tiếu bò kho", category: "Thức ăn", unit: "Tô", price: 35000, stock: 80, batch: "L01", expiry: "2026-12-31" },
        { id: "HH-003", name: "Sữa đậu nành", category: "Đồ uống", unit: "Ly", price: 10000, stock: 50, batch: "L02", expiry: "2026-05-20" },
      ];
      const customers = [
        { id: "000001", name: "Bán Lẻ", gender: "1", address: "TP. Cần Thơ", phone: "0795986289", email: "khachle@gmail.com", totalSpent: 1250000 },
        { id: "KH-00235", name: "Đặng Thành Trung", gender: "1", address: "Ninh Kiều, Cần Thơ", phone: "0901234567", email: "trungdt@gmail.com", totalSpent: 5000000 },
      ];
      const staff = [
        { id: "NV001", name: "Quản trị viên", username: "admin", role: "admin", status: "Đang làm việc" },
      ];

      for (const p of products) await productService.create(p);
      for (const c of customers) await customerService.create(c);
      for (const s of staff) await staffService.create(s);
      
      showNotification("Đã khởi tạo dữ liệu mẫu thành công!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Seed error:", error);
      showNotification("Lỗi khi khởi tạo dữ liệu", "error");
    }
  };

  useEffect(() => {
    productService.getAll().then(res => setProducts(res.data));
    customerService.getAll().then(res => {
      setCustomers(res.data);
      if (res.data.length > 0 && !selectedCustomer) setSelectedCustomer(res.data[0]);
    });
    invoiceService.getAll().then(res => setRecentInvoices(res.data.slice(0, 5)));
    systemService.getSettings().then(res => setSettings(res.data));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "F1":
          e.preventDefault();
          setCart([]);
          setPaid(0);
          searchInputRef.current?.focus();
          break;
        case "F2":
          e.preventDefault();
          setActiveTab("customer");
          customerSelectRef.current?.focus();
          break;
        case "F3":
          e.preventDefault();
          showNotification("Chức năng Nhập hàng đang được phát triển", "error");
          break;
        case "F4":
          e.preventDefault();
          handleCheckout();
          break;
        case "F5":
          e.preventDefault();
          handlePrint();
          break;
        case "F6":
          e.preventDefault();
          if (confirm("Bạn có chắc chắn muốn hủy bỏ đơn hàng này?")) {
            setCart([]);
            setPaid(0);
            showNotification("Đã hủy đơn hàng");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, paid, selectedCustomer]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const change = paid > 0 ? paid - total : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return showNotification("Giỏ hàng trống!", "error");
    if (isSubmitting) return;
    
    if (paid < total) {
      setActiveTab("payment");
      showNotification("Tiền khách trả chưa đủ!", "error");
      return;
    }

    const invoiceData = {
      customerId: selectedCustomer?.id || "KL",
      items: cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      total: total
    };

    setIsSubmitting(true);
    invoiceService.create(invoiceData as any).then(() => {
      showNotification("Thanh toán thành công! Đã in hóa đơn.");
      setCart([]);
      setPaid(0);
      setActiveTab("customer");
      invoiceService.getAll().then(res => setRecentInvoices(res.data.slice(0, 5)));
    }).catch(err => {
      console.error(err);
      showNotification("Lỗi khi thanh toán", "error");
    }).finally(() => setIsSubmitting(false));
  };

  // Automatically set paid amount to total if it's currently 0 and items are in cart
  // This helps with "exact change" scenarios
  const setExactChange = () => setPaid(total);

  const handlePrint = () => {
    if (cart.length === 0) return showNotification("Không có gì để in!", "error");
    showNotification(`Đang in hóa đơn ${invoiceId}...`);
  };

  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface flex-col md:flex-row">
      {/* Mobile POS Header */}
      <header className="md:hidden flex justify-between items-center px-4 h-14 bg-white border-b border-outline-variant/10 z-50">
        <div className="flex items-center gap-2">
          <Store className="text-primary w-6 h-6" />
          <h1 className="text-sm font-bold truncate max-w-[120px]">{settings?.tendv || "Sumi.Mart"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsScanning(true)}
            className="p-2 text-primary bg-primary/5 rounded-lg"
          >
            <Scan className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-primary bg-primary/10 rounded-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Sidebar POS */}
      <aside className={cn(
        "fixed inset-0 z-[100] md:relative md:z-auto w-full md:w-[320px] lg:w-[380px] flex flex-col bg-surface-container-low md:border-r md:border-outline-variant/10 transition-transform duration-500 ease-in-out md:translate-x-0 bg-white md:bg-surface-container-low",
        isCartOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        {/* Mobile Header for Sidebar */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-outline-variant/10 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 -ml-2 text-on-surface-variant"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-base font-black uppercase tracking-tight">Thanh toán đơn hàng</h2>
          </div>
          <p className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded">#{invoiceId}</p>
        </div>

        <div className="hidden md:flex p-6 border-b border-outline-variant/10 flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <Store className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-primary-container leading-tight truncate max-w-[150px]">
                {settings?.tendv || "Sumi.Mart POS"}
              </h1>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">NV: Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex md:flex-col p-2 md:p-0 bg-surface-container-lowest md:bg-transparent border-b md:border-b-0 sticky top-0 z-10">
          <POSNavItem 
            icon={PersonStanding} 
            label="Khách" 
            active={activeTab === "customer"} 
            onClick={() => setActiveTab("customer")}
          />
          <POSNavItem 
            icon={CreditCard} 
            label="Thanh toán" 
            active={activeTab === "payment"} 
            onClick={() => setActiveTab("payment")}
          />
          <POSNavItem 
            icon={History} 
            label="Lịch sử" 
            active={activeTab === "history"} 
            onClick={() => setActiveTab("history")}
          />
          <POSNavItem 
            icon={Tag} 
            label="Ưu đãi" 
            active={activeTab === "promo"} 
            onClick={() => setActiveTab("promo")}
          />
        </nav>

        <div className="p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6 md:space-y-8 pb-32">
          {activeTab === "customer" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Thông tin khách hàng</h2>
                <button className="text-[10px] font-black text-primary uppercase">+ Khách mới</button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Chọn khách hàng</label>
                  <select 
                    ref={customerSelectRef}
                    className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none w-full appearance-none shadow-sm"
                    value={selectedCustomer?.id || ""}
                    onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                  >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.id}</option>)}
                  </select>
                </div>
                {selectedCustomer && (
                  <div className="grid grid-cols-1 gap-4">
                    <POSInput label="Địa chỉ" value={selectedCustomer.address} />
                    <POSInput label="Điện thoại" value={selectedCustomer.phone} />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="space-y-6">
              <h2 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Chi tiết thanh toán</h2>
              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex justify-between items-end border-b border-primary/10 pb-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Tổng tiền hóa đơn</span>
                  <span className="text-3xl font-black text-primary leading-none">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between items-end border-b border-primary/10 pb-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Khách đưa</span>
                    <button 
                      onClick={setExactChange}
                      className="text-[10px] font-black bg-primary text-white px-3 py-1.5 rounded-full hover:brightness-110 transition-all uppercase tracking-widest active:scale-95"
                    >
                      Tiền mặt (Đủ)
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <input 
                      className="text-3xl font-black text-primary-container text-right bg-transparent border-none p-0 w-32 md:w-48 focus:ring-0 outline-none" 
                      type="number" 
                      value={paid}
                      onChange={(e) => setPaid(Number(e.target.value))}
                    />
                    <span className="text-sm font-black text-primary opacity-50">₫</span>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Tiền thối lại</span>
                  <span className="text-3xl font-black text-tertiary-container leading-none">{formatCurrency(change)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-outline-variant/10 bg-white hover:bg-surface-container-low transition-all">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase">Chuyển khoản</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-primary/20 bg-primary/5 transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-primary">Tiền mặt</span>
                </button>
              </div>
            </div>
          )}
          {/* ... history and promo tabs remain similar but with padded classes ... */}

          {activeTab === "history" && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.1em]">Lịch sử đơn hàng gần đây</h2>
              <div className="space-y-3">
                {recentInvoices.map(inv => (
                  <div key={inv.id} className="p-3 bg-white rounded-lg border border-outline-variant/10 shadow-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-primary">{inv.id}</span>
                      <span className="text-[10px] font-bold text-on-surface-variant">{inv.time}</span>
                    </div>
                    <p className="text-xs font-medium truncate">{inv.products}</p>
                    <div className="flex justify-between mt-2 items-center">
                      <span className="text-xs font-black">{formatCurrency(inv.total)}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded uppercase font-bold">{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "promo" && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.1em]">Chương trình ưu đãi</h2>
              <div className="p-4 bg-tertiary-container/10 border border-tertiary/20 rounded-xl">
                <p className="text-sm font-bold text-tertiary-container mb-1">Giảm giá 5% cho khách hàng VIP</p>
                <p className="text-xs text-on-surface-variant">Áp dụng cho hóa đơn từ 1.000.000đ trở lên.</p>
              </div>
              <div className="p-4 bg-primary-container/10 border border-primary/20 rounded-xl">
                <p className="text-sm font-bold text-primary-container mb-1">Mua 2 tặng 1 Sữa tươi TH</p>
                <p className="text-xs text-on-surface-variant">Áp dụng đến hết ngày 30/04/2026.</p>
              </div>
            </div>
          )}
        </div>

        <div className="fixed md:absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md md:bg-surface-container-highest/50 border-t border-outline-variant/10 z-[110]">
          <button 
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs"
          >
            {isSubmitting ? (
              <RefreshCcw className="w-5 h-5 animate-spin" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
            <span>Xác nhận & In [F4]</span>
          </button>
        </div>
      </aside>

      {/* Main POS Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white md:bg-transparent">
        <header className="hidden md:flex justify-between items-center px-8 py-4 bg-white border-b border-outline-variant/10">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input 
                ref={searchInputRef}
                className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/15 rounded-xl w-60 lg:w-80 focus:ring-2 focus:ring-primary focus:outline-none text-sm" 
                placeholder="Tìm hàng (tên hoặc mã)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-b-xl border border-outline-variant/10 z-50 max-h-60 overflow-y-auto">
                  {filteredProducts.map(p => (
                    <div 
                      key={p.id} 
                      className="p-3 hover:bg-surface-container-low cursor-pointer flex justify-between items-center border-b border-outline-variant/5"
                      onClick={() => {
                        addToCart(p);
                        setSearchQuery("");
                      }}
                    >
                      <div>
                        <p className="text-sm font-bold">{p.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{p.id} | Tồn: {p.stock}</p>
                      </div>
                      <p className="text-sm font-bold text-primary">{formatCurrency(p.price)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsScanning(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs hover:bg-primary/20 transition-all active:scale-95"
            >
              <Scan className="w-4 h-4" />
              Quét mã
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={seedData}
              className="text-[10px] font-bold text-on-surface-variant/40 hover:text-primary transition-colors uppercase tracking-widest"
            >
              Seed
            </button>
            <Bell className="text-on-surface-variant w-5 h-5 cursor-pointer" />
            <UserCircle className="text-on-surface-variant w-5 h-5 cursor-pointer" />
          </div>
        </header>

        {/* Mobile Search Bar */}
        <div className="md:hidden p-4 bg-white border-b border-outline-variant/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input 
              ref={searchInputRef}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/15 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm" 
              placeholder="Tìm tên hàng hoặc mã vạch..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="fixed top-[110px] left-4 right-4 bg-white shadow-2xl rounded-xl border border-outline-variant/10 z-[60] max-h-[60vh] overflow-y-auto">
                {filteredProducts.map(p => (
                  <div 
                    key={p.id} 
                    className="p-4 hover:bg-surface-container-low cursor-pointer flex justify-between items-center border-b border-outline-variant/5 active:bg-surface-container-highest"
                    onClick={() => {
                      addToCart(p);
                      setSearchQuery("");
                    }}
                  >
                    <div>
                      <p className="text-sm font-bold">{p.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{p.id} | Tồn: {p.stock}</p>
                    </div>
                    <p className="text-sm font-bold text-primary">{formatCurrency(p.price)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 bg-surface-container-low flex flex-col gap-4 md:gap-6 overflow-hidden pb-24 md:pb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex flex-col">
              <h2 className="text-lg md:text-2xl font-bold tracking-tight text-primary-container">Đơn hàng hiện tại</h2>
              <p className="text-[10px] md:text-sm text-on-surface-variant">Hoá đơn #{invoiceId} | {new Date().toLocaleDateString()}</p>
            </div>
            <div className="hidden sm:flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handlePrint}
                className="flex-1 sm:flex-none px-3 py-2 bg-white border border-outline-variant/30 rounded-lg text-xs font-bold text-on-surface flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> In
              </button>
              <button 
                onClick={() => searchInputRef.current?.focus()}
                className="flex-1 sm:flex-none px-3 py-2 bg-primary-container text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm [F1]
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-outline-variant/5">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-low border-b border-outline-variant/10">
              <div className="col-span-1 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Mã</div>
              <div className="col-span-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tên hàng hóa</div>
              <div className="col-span-1 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-center">Đvt</div>
              <div className="col-span-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Giá</div>
              <div className="col-span-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-center">S.lượng</div>
              <div className="col-span-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Tổng</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-30 gap-3 md:gap-4 p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10" />
                  </div>
                  <p className="font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">Chưa có sản phẩm nào</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-4 sm:grid sm:grid-cols-12 sm:gap-4 sm:px-6 sm:py-4 items-center border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors group">
                    {/* Mobile Item View */}
                    <div className="sm:hidden flex justify-between items-start mb-3">
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-bold text-on-surface line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold">{item.id} • {item.unit} • <span className="text-primary">{formatCurrency(item.price)}</span></p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-error/30 hover:text-error transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="hidden sm:block col-span-1 text-xs font-medium text-on-surface-variant">{item.id}</div>
                    <div className="hidden sm:block col-span-4">
                      <p className="text-sm font-bold text-on-surface">{item.name}</p>
                      <p className="text-[10px] text-on-surface-variant">Loại: {item.category}</p>
                    </div>
                    <div className="hidden sm:block col-span-1 text-xs text-on-surface-variant text-center">{item.unit}</div>
                    <div className="hidden sm:block col-span-2 text-xs font-semibold text-on-surface text-right">{formatCurrency(item.price)}</div>
                    
                    <div className="sm:col-span-2 flex justify-between sm:justify-center items-center">
                      <div className="flex items-center gap-1 bg-surface-container-low rounded-xl px-1 py-1 border border-outline-variant/10">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)} 
                          className="w-8 h-8 flex items-center justify-center text-primary-container hover:bg-white rounded-lg transition-all active:scale-90"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-black w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)} 
                          className="w-8 h-8 flex items-center justify-center text-primary-container hover:bg-white rounded-lg transition-all active:scale-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="sm:hidden text-right">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase opacity-40">Thành tiền</p>
                        <p className="text-sm font-black text-primary">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex col-span-2 items-center justify-end gap-3 lg:gap-4">
                      <span className="text-sm font-bold text-primary">{formatCurrency(item.price * item.quantity)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-error/30 hover:text-error hover:bg-error/5 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Mobile Summary Bar */}
        <div className="md:hidden fixed bottom-14 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-outline-variant/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Tổng cộng</span>
              <span className="text-xl font-black text-primary leading-none">{formatCurrency(total)}</span>
            </div>
            <button 
              onClick={() => {
                if (cart.length > 0) {
                  setIsCartOpen(true);
                  setActiveTab("payment");
                } else {
                  showNotification("Giỏ hàng trống", "error");
                }
              }}
              className="flex-1 bg-primary text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest text-[11px]"
            >
              <CreditCard className="w-5 h-5" />
              <span>Thanh toán {cart.length > 0 && `(${cart.length})`}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <footer className="hidden md:flex h-12 bg-primary-container justify-around items-center px-4 shadow-2xl">
          <POSFooterBtn label="[F1] Thêm HĐ" onClick={() => { setCart([]); setPaid(0); searchInputRef.current?.focus(); }} />
          <POSFooterBtn label="[F2] Khách hàng" onClick={() => setActiveTab("customer")} />
          <POSFooterBtn label="[F3] Nhập hàng" onClick={() => showNotification("Chức năng Nhập hàng đang được phát triển", "error")} />
          <POSFooterBtn label="[F4] Thanh toán" active onClick={handleCheckout} disabled={isSubmitting} />
          <POSFooterBtn label="[F5] In" onClick={handlePrint} />
          <POSFooterBtn label="[F6] Hủy" error onClick={() => { if(confirm("Hủy đơn hàng?")) { setCart([]); showNotification("Đã hủy đơn hàng"); } }} />
        </footer>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className={cn(
              "fixed bottom-8 left-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-md",
              notification.type === 'success' 
                ? "bg-green-500/90 border-green-400 text-white" 
                : "bg-red-500/90 border-red-400 text-white"
            )}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold tracking-tight">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col pt-safe"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-bold uppercase tracking-widest text-sm">Quét mã vạch</h3>
              <button 
                onClick={() => setIsScanning(false)}
                className="p-2 text-white bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div id="reader" className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/30" />
              <div className="mt-8 text-center bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10 max-w-xs">
                <p className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">Đang tìm mã vạch...</p>
                <p className="text-white/50 text-[10px] leading-relaxed">Đưa mã vạch của sản phẩm vào khung ngắm để hệ thống tự động nhận diện.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function POSNavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 md:w-full flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-4 py-3 transition-all duration-300",
        active 
          ? "text-primary font-black border-b-2 md:border-b-0 md:border-r-4 border-primary bg-primary/5" 
          : "text-on-surface-variant/60 hover:bg-surface-container-highest/30"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "scale-110" : "opacity-50")} />
      <span className="text-[9px] md:text-sm uppercase tracking-widest font-black">{label}</span>
    </button>
  );
}

function POSInput({ label, value }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">{label}</label>
      <input 
        className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-bold text-on-surface-variant outline-none" 
        readOnly 
        value={value} 
      />
    </div>
  );
}

function POSFooterBtn({ label, active, error, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-3 py-1 rounded transition-all text-[10px] font-bold uppercase tracking-wider",
        active ? "bg-white/20 text-white" : error ? "text-error-container hover:bg-error/10" : "text-white/70 hover:bg-white/10",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {label}
    </button>
  );
}
