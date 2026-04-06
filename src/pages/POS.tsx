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

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar POS */}
      <aside className="w-[30%] flex flex-col bg-surface-container-low border-r border-outline-variant/10">
        <div className="p-6 border-b border-outline-variant/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <Store className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-container leading-tight">{settings?.tendv || "Sumi.Mart POS"}</h1>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Nhân viên: Quản trị viên</p>
            </div>
          </div>
          <nav className="space-y-1">
            <POSNavItem 
              icon={PersonStanding} 
              label="Chi tiết khách hàng" 
              active={activeTab === "customer"} 
              onClick={() => setActiveTab("customer")}
            />
            <POSNavItem 
              icon={CreditCard} 
              label="Tổng thanh toán" 
              active={activeTab === "payment"} 
              onClick={() => setActiveTab("payment")}
            />
            <POSNavItem 
              icon={History} 
              label="Lịch sử giao dịch" 
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
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
          {activeTab === "customer" && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.1em]">Thông tin khách hàng</h2>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Chọn khách hàng</label>
                  <select 
                    ref={customerSelectRef}
                    className="bg-white border border-outline-variant/15 rounded px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                    value={selectedCustomer?.id || ""}
                    onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                  >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.id}</option>)}
                  </select>
                </div>
                {selectedCustomer && (
                  <>
                    <POSInput label="Địa chỉ" value={selectedCustomer.address} />
                    <POSInput label="Điện thoại" value={selectedCustomer.phone} />
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="bg-white p-6 rounded-xl border border-outline-variant/10 shadow-sm space-y-6">
              <div className="flex justify-between items-end border-b border-surface-container-low pb-4">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tổng tiền [1]</span>
                <span className="text-3xl font-black text-error leading-none">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-end border-b border-surface-container-low pb-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Khách hàng trả [2]</span>
                  <button 
                    onClick={setExactChange}
                    className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                  >
                    Tiền mặt (Đủ)
                  </button>
                </div>
                <input 
                  className="text-3xl font-black text-primary-container text-right bg-transparent border-none p-0 w-48 focus:ring-0" 
                  type="number" 
                  value={paid}
                  onChange={(e) => setPaid(Number(e.target.value))}
                />
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tiền thừa [2]-[1]</span>
                <span className="text-3xl font-black text-tertiary-container leading-none">{formatCurrency(change)}</span>
              </div>
            </div>
          )}

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

        <div className="p-6 bg-surface-container-highest/50">
          <button 
            onClick={handleCheckout}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <CreditCard className="w-6 h-6" />
            <span>Thanh toán [F4]</span>
          </button>
        </div>
      </aside>

      {/* Main POS Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-outline-variant/10">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input 
                ref={searchInputRef}
                className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/15 rounded-xl w-80 focus:ring-2 focus:ring-primary focus:outline-none text-sm" 
                placeholder="Tìm hàng hóa (tên hoặc mã)..." 
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
                        <p className="text-xs text-on-surface-variant">{p.id} | Tồn: {p.stock}</p>
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
              Khởi tạo dữ liệu mẫu
            </button>
            <Bell className="text-on-surface-variant w-5 h-5 cursor-pointer" />
            <UserCircle className="text-on-surface-variant w-5 h-5 cursor-pointer" />
          </div>
        </header>

        <main className="flex-1 p-8 bg-surface-container-low flex flex-col gap-6 overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold tracking-tight text-primary-container">Danh sách sản phẩm</h2>
              <p className="text-sm text-on-surface-variant">Hoá đơn #{invoiceId} | {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-white border border-outline-variant/30 rounded-lg text-sm font-bold text-on-surface flex items-center gap-2 hover:bg-surface-container-highest transition-colors"
              >
                <Printer className="w-4 h-4" /> In tạm
              </button>
              <button 
                onClick={() => searchInputRef.current?.focus()}
                className="px-4 py-2 bg-primary-container text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Thêm hàng [F1]
              </button>
            </div>
          </div>

          <div className="flex-1 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-low border-b border-outline-variant/10">
              <div className="col-span-1 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Mã</div>
              <div className="col-span-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Tên hàng hóa</div>
              <div className="col-span-1 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-center">Đvt</div>
              <div className="col-span-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Giá bán</div>
              <div className="col-span-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-center">Số lượng</div>
              <div className="col-span-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right">Thành tiền</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-50 gap-4">
                  <ShoppingCart className="w-16 h-16" />
                  <p className="font-bold uppercase tracking-widest text-xs">Giỏ hàng đang trống</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors">
                    <div className="col-span-1 text-sm font-medium text-on-surface-variant">{item.id}</div>
                    <div className="col-span-4">
                      <p className="text-sm font-bold text-on-surface">{item.name}</p>
                      <p className="text-xs text-on-surface-variant">Phân loại: {item.category}</p>
                    </div>
                    <div className="col-span-1 text-sm text-on-surface-variant text-center">{item.unit}</div>
                    <div className="col-span-2 text-sm font-semibold text-on-surface text-right">{formatCurrency(item.price)}</div>
                    <div className="col-span-2 flex justify-center">
                      <div className="flex items-center gap-2 bg-surface-container-low rounded px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-primary-container"><Minus className="w-3 h-3" /></button>
                        <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-primary-container"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-4">
                      <span className="text-sm font-bold text-primary">{formatCurrency(item.price * item.quantity)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-error hover:bg-error/10 p-1 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        <footer className="h-12 bg-primary-container flex justify-around items-center px-4 shadow-2xl">
          <POSFooterBtn label="[F1] Thêm HĐ" onClick={() => { setCart([]); setPaid(0); searchInputRef.current?.focus(); }} />
          <POSFooterBtn label="[F2] Khách hàng" onClick={() => setActiveTab("customer")} />
          <POSFooterBtn label="[F3] Nhập hàng" onClick={() => showNotification("Chức năng Nhập hàng đang được phát triển", "error")} />
          <POSFooterBtn label="[F4] Thanh toán" active onClick={handleCheckout} disabled={isSubmitting} />
          <POSFooterBtn label="[F5] In hóa đơn" onClick={handlePrint} />
          <POSFooterBtn label="[F6] Hủy bỏ" error onClick={() => { if(confirm("Hủy bỏ đơn hàng?")) { setCart([]); showNotification("Đã hủy đơn hàng"); } }} />
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
