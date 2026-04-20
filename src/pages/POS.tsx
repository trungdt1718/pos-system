import React, { useState, useEffect } from "react";
import { Search, Bell, UserCircle, Store, PersonStanding, CreditCard, History, Tag, ShoppingCart, Printer, Plus, Minus, Trash2, Save, X, CheckCircle2, AlertCircle } from "lucide-react";
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

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
      </header>

      {/* Sidebar POS */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-full md:w-[320px] lg:w-[380px] md:relative flex flex-col bg-surface-container-low border-r border-outline-variant/10 transition-transform duration-300 md:translate-x-0",
        isCartOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 md:p-6 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <Store className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-primary-container leading-tight truncate max-w-[150px]">
                {settings?.tendv || "Sumi.Mart POS"}
              </h1>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">NV: Admin</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="md:hidden p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible border-b md:border-b-0 border-outline-variant/5">
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

        <div className="p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6 md:space-y-8">
          {activeTab === "customer" && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.1em]">Thông tin khách hàng</h2>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Chọn khách hàng</label>
                  <select 
                    ref={customerSelectRef}
                    className="bg-white border border-outline-variant/15 rounded px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none w-full"
                    value={selectedCustomer?.id || ""}
                    onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                  >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.id}</option>)}
                  </select>
                </div>
                {selectedCustomer && (
                  <div className="grid grid-cols-1 gap-3">
                    <POSInput label="Địa chỉ" value={selectedCustomer.address} />
                    <POSInput label="Điện thoại" value={selectedCustomer.phone} />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="bg-white p-4 md:p-6 rounded-xl border border-outline-variant/10 shadow-sm space-y-6">
              <div className="flex justify-between items-end border-b border-surface-container-low pb-4">
                <span className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tổng tiền</span>
                <span className="text-2xl md:text-3xl font-black text-error leading-none">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-end border-b border-surface-container-low pb-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Khách trả</span>
                  <button 
                    onClick={setExactChange}
                    className="text-[9px] md:text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors w-fit"
                  >
                    Tiền mặt (Đủ)
                  </button>
                </div>
                <input 
                  className="text-2xl md:text-3xl font-black text-primary-container text-right bg-transparent border-none p-0 w-32 md:w-48 focus:ring-0" 
                  type="number" 
                  value={paid}
                  onChange={(e) => setPaid(Number(e.target.value))}
                />
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tiền thừa</span>
                <span className="text-2xl md:text-3xl font-black text-tertiary-container leading-none">{formatCurrency(change)}</span>
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

        <div className="p-4 md:p-6 bg-surface-container-highest/50 mt-auto">
          <button 
            onClick={handleCheckout}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-sm md:text-base">Thanh toán [F4]</span>
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

        <main className="flex-1 p-4 md:p-8 bg-surface-container-low flex flex-col gap-4 md:gap-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex flex-col">
              <h2 className="text-lg md:text-2xl font-bold tracking-tight text-primary-container">Đơn hàng hiện tại</h2>
              <p className="text-[10px] md:text-sm text-on-surface-variant">Hoá đơn #{invoiceId} | {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
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

          <div className="flex-1 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col border border-outline-variant/5">
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
                  <ShoppingCart className="w-12 h-12 md:w-16 md:h-16" />
                  <p className="font-bold uppercase tracking-widest text-[10px] md:text-xs">Giỏ hàng đang trống</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-4 sm:grid sm:grid-cols-12 sm:gap-4 sm:px-6 sm:py-4 items-center border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors">
                    {/* Mobile Item Vie */}
                    <div className="sm:hidden flex justify-between items-start mb-3">
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-bold text-on-surface line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{item.id} • {item.unit}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-error p-1">
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
                      <div className="flex sm:hidden flex-col">
                        <p className="text-xs font-bold text-primary">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-surface-container-low rounded-lg px-2 py-1.5 border border-outline-variant/10">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-primary-container p-0.5"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-primary-container p-0.5"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="sm:hidden text-right">
                        <p className="text-sm font-black text-primary">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex col-span-2 items-center justify-end gap-3 lg:gap-4">
                      <span className="text-sm font-bold text-primary">{formatCurrency(item.price * item.quantity)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-error hover:bg-error/10 p-1.5 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

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
    </div>
  );
}

function POSNavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 transition-all duration-200",
        active 
          ? "text-primary-container font-bold border-r-4 border-primary bg-surface-container-highest/20" 
          : "text-on-surface-variant hover:bg-surface-container-highest/30"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm uppercase tracking-wide">{label}</span>
    </button>
  );
}

function POSInput({ label, value }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-on-surface-variant uppercase">{label}</label>
      <input className="bg-white border border-outline-variant/15 rounded px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none" readOnly value={value} />
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
