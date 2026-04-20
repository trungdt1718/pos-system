import React, { useEffect, useState } from "react";
import { productService } from "../services/api";
import { Product } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { Filter, Download, Edit, Trash2, PlusCircle, Edit3, CheckCircle2, AlertCircle, Save, Package, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Mobile specific: toggle between list and detail
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    category: "Thực phẩm",
    unit: "Hộp",
    price: 0,
    stock: 0,
    manufacturer: "",
    origin: "",
    supplier: ""
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    productService.getAll().then(res => {
      setProducts(res.data);
      if (res.data.length > 0 && !selectedProduct && !isAdding && window.innerWidth >= 1024) {
        setSelectedProduct(res.data[0]);
      }
    });
  };

  const handleUpdate = () => {
    if (selectedProduct && !isSubmitting) {
      setIsSubmitting(true);
      productService.update(selectedProduct.id, selectedProduct).then(() => {
        loadProducts();
        showNotification("Cập nhật sản phẩm thành công!");
        if (window.innerWidth < 1024) setShowDetailOnMobile(false);
      }).catch(err => {
        console.error(err);
        showNotification("Lỗi khi cập nhật sản phẩm", "error");
      }).finally(() => setIsSubmitting(false));
    }
  };

  const handleDelete = () => {
    if (selectedProduct && !isSubmitting) {
      if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${selectedProduct.name}?`)) {
        setIsSubmitting(true);
        productService.delete(selectedProduct.id).then(() => {
          setSelectedProduct(null);
          loadProducts();
          showNotification("Đã xóa sản phẩm!");
          if (window.innerWidth < 1024) setShowDetailOnMobile(false);
        }).catch(err => {
          console.error(err);
          showNotification("Lỗi khi xóa sản phẩm", "error");
        }).finally(() => setIsSubmitting(false));
      }
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setSelectedProduct(null);
    setFormData({
      name: "",
      category: "Thực phẩm",
      unit: "Hộp",
      price: 0,
      stock: 0,
      manufacturer: "",
      origin: "",
      supplier: ""
    });
    if (window.innerWidth < 1024) setShowDetailOnMobile(true);
  };

  const handleSaveNew = () => {
    if (!formData.name) return showNotification("Vui lòng nhập tên sản phẩm!", "error");
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    productService.create(formData).then((res) => {
      setIsAdding(false);
      loadProducts();
      setSelectedProduct(res.data);
      showNotification("Thêm sản phẩm mới thành công!");
      if (window.innerWidth < 1024) setShowDetailOnMobile(false);
    }).catch(err => {
      console.error(err);
      showNotification("Lỗi khi thêm sản phẩm", "error");
    }).finally(() => setIsSubmitting(false));
  };

  return (
    <div className="relative flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-112px)] gap-6 overflow-hidden">
      {/* Left Pane: Product List */}
      <section className={cn(
        "flex-[1.2] flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/5 transition-all duration-300",
        showDetailOnMobile ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-4 md:p-5 border-b border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base md:text-lg font-bold tracking-tight text-primary-container uppercase">Hàng hóa</h2>
            <p className="text-[10px] md:text-xs text-on-surface-variant font-medium">Hiện có {products.length} sản phẩm</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-[11px] md:text-xs font-black text-on-secondary-container bg-surface-container-highest rounded-full transition-all active:scale-95">
              <Filter className="w-3.5 h-3.5" /> Lọc
            </button>
            <button 
              onClick={startAdding}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 text-[11px] md:text-xs font-black text-white bg-primary rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Thêm mới
            </button>
          </div>
        </div>
        
        {/* Mobile: Card View */}
        <div className="flex-1 overflow-auto custom-scrollbar md:hidden">
          <div className="p-4 space-y-3">
            {products.map((product) => (
              <div 
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setIsAdding(false);
                  setShowDetailOnMobile(true);
                }}
                className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/5 active:scale-98 transition-transform"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{product.id}</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 text-[8px] font-black bg-secondary-container text-on-secondary-container rounded-full uppercase">
                      {product.category}
                    </span>
                    <span className="px-2 py-0.5 text-[8px] font-black bg-primary/10 text-primary rounded-full uppercase">
                      {product.unit}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-black text-primary-container mb-2">{product.name}</h3>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Tồn kho</p>
                    <p className="text-sm font-black text-on-surface">{product.stock}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Giá bán</p>
                    <p className="text-lg font-black text-primary">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Table View */}
        <div className="hidden md:block flex-1 overflow-auto custom-scrollbar">
          <div className="min-w-[600px] lg:min-w-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-low z-10">
                <tr>
                  <th className="px-4 md:px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mã số</th>
                  <th className="px-4 md:px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tên hàng hóa</th>
                  <th className="px-4 md:px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Đơn vị</th>
                  <th className="px-4 md:px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Giá bán</th>
                  <th className="px-4 md:px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tồn kho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {products.map((product) => (
                  <tr 
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsAdding(false);
                    }}
                    className={cn(
                      "hover:bg-surface-container-low transition-colors cursor-pointer",
                      selectedProduct?.id === product.id && !isAdding && "bg-primary-fixed/30 border-l-4 border-primary"
                    )}
                  >
                    <td className="px-4 md:px-5 py-4 text-xs font-black text-primary uppercase">{product.id}</td>
                    <td className="px-4 md:px-5 py-4 text-sm font-bold text-primary-container">{product.name}</td>
                    <td className="px-4 md:px-5 py-4 text-xs font-bold text-on-surface-variant uppercase">{product.unit}</td>
                    <td className="px-4 md:px-5 py-4 text-sm font-black text-primary">{formatCurrency(product.price)}</td>
                    <td className="px-4 md:px-5 py-4 text-sm font-bold text-on-surface">{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Right Pane: Product Detail Form */}
      <section 
        className={cn(
          "flex-[0.8] flex flex-col bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/5 lg:relative",
          "fixed inset-0 z-[60] lg:inset-auto lg:z-auto transition-transform duration-300 transform",
          showDetailOnMobile ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          !showDetailOnMobile && "hidden lg:flex"
        )}
      >
        <div className="p-4 md:p-5 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowDetailOnMobile(false)}
              className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full"
            >
              <Edit3 className="w-5 h-5 rotate-180" />
            </button>
            <h2 className="text-base md:text-lg font-black tracking-tight text-primary-container uppercase">
              {isAdding ? "Thêm hàng hóa" : "Chi tiết hàng hóa"}
            </h2>
          </div>
          <button 
            onClick={() => setShowDetailOnMobile(false)}
            className="lg:hidden p-2 text-on-surface-variant"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-surface-container-lowest">
          {(isAdding || selectedProduct) ? (
            <div className="space-y-6">
              {/* Section: Basic Info */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 border-b border-primary/10 pb-2">Thông tin cơ bản</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase mb-1.5">Tên hàng hóa</label>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
                      placeholder="Nhập tên sản phẩm..."
                      value={isAdding ? formData.name : selectedProduct?.name}
                      onChange={(e) => isAdding ? setFormData({...formData, name: e.target.value}) : setSelectedProduct({...selectedProduct!, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase mb-1.5">Đơn vị tính</label>
                    <select 
                      className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none"
                      value={isAdding ? formData.unit : selectedProduct?.unit}
                      onChange={(e) => isAdding ? setFormData({...formData, unit: e.target.value}) : setSelectedProduct({...selectedProduct!, unit: e.target.value})}
                    >
                      <option>Hộp</option>
                      <option>Cái</option>
                      <option>Chai</option>
                      <option>Gói</option>
                      <option>Túi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase mb-1.5">Phân loại</label>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none" 
                      placeholder="Thực phẩm, Đồ uống..."
                      value={isAdding ? formData.category : selectedProduct?.category}
                      onChange={(e) => isAdding ? setFormData({...formData, category: e.target.value}) : setSelectedProduct({...selectedProduct!, category: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              {/* Section: Pricing & Stock */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 border-b border-primary/10 pb-2">Giá & Tồn kho</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase mb-1.5">Giá bán</label>
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-lg font-black text-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all" 
                        value={isAdding ? formData.price : selectedProduct?.price}
                        onChange={(e) => isAdding ? setFormData({...formData, price: Number(e.target.value)}) : setSelectedProduct({...selectedProduct!, price: Number(e.target.value)})}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-primary opacity-50">₫</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase mb-1.5">Tồn kho</label>
                    <input 
                      type="number"
                      className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-lg font-black text-on-surface focus:ring-2 focus:ring-primary/10 outline-none" 
                      value={isAdding ? formData.stock : selectedProduct?.stock}
                      onChange={(e) => isAdding ? setFormData({...formData, stock: Number(e.target.value)}) : setSelectedProduct({...selectedProduct!, stock: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Origin */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 border-b border-primary/10 pb-2">Nguồn gốc & Nhà SX</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase mb-1.5">Nhà sản xuất</label>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-sm font-bold outline-none" 
                      value={isAdding ? formData.manufacturer : selectedProduct?.manufacturer || ""}
                      onChange={(e) => isAdding ? setFormData({...formData, manufacturer: e.target.value}) : setSelectedProduct({...selectedProduct!, manufacturer: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase mb-1.5">Nước sản xuất</label>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-sm font-bold outline-none" 
                      value={isAdding ? formData.origin : selectedProduct?.origin || ""}
                      onChange={(e) => isAdding ? setFormData({...formData, origin: e.target.value}) : setSelectedProduct({...selectedProduct!, origin: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase mb-1.5">Nhà cung cấp</label>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-sm font-bold outline-none" 
                      value={isAdding ? formData.supplier : selectedProduct?.supplier || ""}
                      onChange={(e) => isAdding ? setFormData({...formData, supplier: e.target.value}) : setSelectedProduct({...selectedProduct!, supplier: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant gap-4 opacity-40">
              <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center">
                <Package className="w-10 h-10" />
              </div>
              <p className="italic text-sm font-bold">Chọn hàng hóa để xem chi tiết</p>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-surface-container bg-surface-container-lowest flex justify-end gap-3 pb-safe">
          {isAdding ? (
            <>
              <button 
                onClick={() => {
                  setIsAdding(false);
                  if (window.innerWidth < 1024) setShowDetailOnMobile(false);
                }}
                className="flex-1 lg:flex-none px-6 py-3 rounded-2xl text-sm font-black text-on-surface-variant hover:bg-surface-container-high transition-all uppercase tracking-widest active:scale-95"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveNew}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 lg:flex-none px-8 py-3 rounded-2xl text-sm font-black text-white bg-primary shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest",
                  isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:brightness-110 active:scale-95"
                )}
              >
                {isSubmitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Lưu ngay</span>
              </button>
            </>
          ) : selectedProduct ? (
            <div className="flex gap-2 w-full">
              <button 
                onClick={handleDelete}
                disabled={isSubmitting}
                className="p-3 rounded-2xl text-error bg-error/5 hover:bg-error/10 transition-all border border-error/20 active:scale-95"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="flex-1"></div>
              <button 
                onClick={() => {
                  if (window.innerWidth < 1024) setShowDetailOnMobile(false);
                }}
                className="hidden lg:block px-6 py-3 rounded-2xl text-sm font-black text-on-surface-variant uppercase tracking-widest"
              >
                Đóng
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="flex-1 lg:flex-none px-8 py-3 rounded-2xl text-sm font-black text-white bg-primary-container shadow-xl shadow-primary-container/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
              >
                <Save className={cn("w-4 h-4", isSubmitting && "animate-spin")} />
                <span>Cập nhật</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={startAdding}
              className="w-full lg:w-auto px-10 py-4 rounded-2xl text-sm font-black text-white bg-primary shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <PlusCircle className="w-5 h-5" /> Thêm sản phẩm
            </button>
          )}
        </div>
      </section>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className={cn(
              "fixed bottom-24 lg:bottom-12 left-1/2 z-[100] flex items-center gap-3 px-8 py-4 rounded-full shadow-2xl border backdrop-blur-xl",
              notification.type === 'success' 
                ? "bg-primary/90 border-primary-container/20 text-white" 
                : "bg-error/90 border-error-container/20 text-white"
            )}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-black tracking-tight uppercase text-xs">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
