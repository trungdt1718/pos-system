import React, { useEffect, useState } from "react";
import { productService } from "../services/api";
import { Product } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { Filter, Download, Edit, Trash2, PlusCircle, Edit3 } from "lucide-react";
import { motion } from "motion/react";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
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
      if (res.data.length > 0 && !selectedProduct && !isAdding) {
        setSelectedProduct(res.data[0]);
      }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct) {
      productService.update(selectedProduct.id, selectedProduct).then(() => {
        loadProducts();
        alert("Cập nhật sản phẩm thành công!");
      });
    }
  };

  const handleDelete = () => {
    if (selectedProduct && window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${selectedProduct.name}?`)) {
      productService.delete(selectedProduct.id).then(() => {
        setSelectedProduct(null);
        loadProducts();
      });
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
  };

  const handleSaveNew = () => {
    if (!formData.name) return alert("Vui lòng nhập tên sản phẩm!");
    productService.create(formData).then((res) => {
      setIsAdding(false);
      loadProducts();
      setSelectedProduct(res.data);
      alert("Thêm sản phẩm mới thành công!");
    });
  };

  return (
    <div className="flex h-[calc(100vh-112px)] gap-6">
      {/* Left Pane: Product List */}
      <section className="flex-[1.2] flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-surface-container flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-primary-container">Danh sách hàng hóa</h2>
            <p className="text-xs text-on-surface-variant">Tổng cộng: {products.length} mặt hàng</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-on-secondary-container bg-secondary-container rounded-lg hover:brightness-95 transition-all">
              <Filter className="w-3 h-3" /> Lọc
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-on-secondary-container bg-secondary-container rounded-lg hover:brightness-95 transition-all">
              <Download className="w-3 h-3" /> Xuất Excel
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface-container-low z-10">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mã số</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tên hàng hóa</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Đơn vị tính</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phân loại</th>
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
                  <td className="px-5 py-4 text-sm font-semibold text-primary">{product.id}</td>
                  <td className="px-5 py-4 text-sm font-medium">{product.name}</td>
                  <td className="px-5 py-4 text-sm text-on-surface-variant">{product.unit}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 text-[10px] font-bold bg-secondary-container text-on-secondary-container rounded-full uppercase">
                      {product.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right Pane: Product Detail Form */}
      <section className="flex-[0.8] flex flex-col bg-surface-container-lowest rounded-xl shadow-sm">
        <div className="p-5 border-b border-surface-container flex items-center gap-3">
          <Edit3 className="text-primary-container w-5 h-5" />
          <h2 className="text-lg font-bold tracking-tight text-primary-container">
            {isAdding ? "Thêm hàng hóa mới" : "Thông tin hàng hóa"}
          </h2>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-6 custom-scrollbar">
          {isAdding ? (
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Tên hàng hóa</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all" 
                  placeholder="Nhập tên hàng hóa..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="col-span-6">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Đơn vị tính</label>
                <select 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/10"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <option>Hộp</option>
                  <option>Cái</option>
                  <option>Chai</option>
                  <option>Gói</option>
                  <option>Túi</option>
                </select>
              </div>
              <div className="col-span-6">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Phân loại</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container" 
                  placeholder="Thực phẩm, Đồ uống..."
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
              <div className="col-span-6">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Giá bán</label>
                <input 
                  type="number"
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <div className="col-span-6">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Tồn kho</label>
                <input 
                  type="number"
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                />
              </div>
              <div className="col-span-6">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Nhà sản xuất</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container" 
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                />
              </div>
              <div className="col-span-6">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Nước sản xuất</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container" 
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                />
              </div>
              <div className="col-span-12">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Nhà cung cấp</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container" 
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                />
              </div>
            </div>
          ) : selectedProduct ? (
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-4">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Mã HH</label>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/15 rounded-lg px-3 py-2 text-sm font-bold text-primary-container focus:ring-0" 
                  readOnly 
                  value={selectedProduct.id} 
                />
              </div>
              <div className="col-span-8">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Tên hàng hóa</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all" 
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                />
              </div>
              <div className="col-span-6">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Đơn vị tính</label>
                <select 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/10"
                  value={selectedProduct.unit}
                  onChange={(e) => setSelectedProduct({...selectedProduct, unit: e.target.value})}
                >
                  <option>Hộp</option>
                  <option>Cái</option>
                  <option>Chai</option>
                  <option>Gói</option>
                  <option>Túi</option>
                </select>
              </div>
              <div className="col-span-6">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Phân loại</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container" 
                  value={selectedProduct.category}
                  onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})}
                />
              </div>
              <div className="col-span-6">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Nhà sản xuất</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container" 
                  value={selectedProduct.manufacturer || ""}
                  onChange={(e) => setSelectedProduct({...selectedProduct, manufacturer: e.target.value})}
                />
              </div>
              <div className="col-span-6">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Nước sản xuất</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container" 
                  value={selectedProduct.origin || ""}
                  onChange={(e) => setSelectedProduct({...selectedProduct, origin: e.target.value})}
                />
              </div>
              <div className="col-span-12">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Nhà cung cấp</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg px-3 py-2 text-sm focus:border-primary-container" 
                  value={selectedProduct.supplier || ""}
                  onChange={(e) => setSelectedProduct({...selectedProduct, supplier: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-on-surface-variant opacity-50 italic text-sm">
              Chọn hàng hóa để xem chi tiết
            </div>
          )}
          <div className="pt-4 opacity-40">
            <div className="h-32 w-full rounded-xl bg-gradient-to-br from-primary-container to-secondary-container p-6 flex flex-col justify-end overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <span className="text-white text-xs font-black uppercase tracking-widest relative z-10">Sumi.Mart Stock Control</span>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-surface-container bg-surface-container-lowest/50 flex justify-end gap-3">
          {isAdding ? (
            <>
              <button 
                onClick={() => setIsAdding(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high transition-all"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveNew}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-primary to-primary-container shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Lưu hàng hóa
              </button>
            </>
          ) : selectedProduct ? (
            <>
              <button 
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-error border border-error/20 hover:bg-error-container hover:border-transparent transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Xóa
              </button>
              <div className="flex-1"></div>
              <button className="px-5 py-2.5 rounded-lg text-sm font-bold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high transition-all">
                Đóng
              </button>
              <button 
                onClick={handleUpdate}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-on-secondary-container bg-secondary-container hover:brightness-95 transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Chỉnh
              </button>
              <button 
                onClick={startAdding}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-primary to-primary-container shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Thêm
              </button>
            </>
          ) : (
            <button 
              onClick={startAdding}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-br from-primary to-primary-container shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Thêm mới
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
