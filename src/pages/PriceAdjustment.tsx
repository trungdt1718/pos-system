import React, { useEffect, useState } from "react";
import { 
  Download, 
  Upload, 
  Filter, 
  ChevronDown, 
  Search,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  Check
} from "lucide-react";
import { cn } from "../lib/utils";
import { formatCurrency } from "../lib/utils";
import { productService } from "../services/api";
import { Product } from "../types";

export default function PriceAdjustment() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [changedPrices, setChangedPrices] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    productService.getAll().then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handlePriceChange = (id: string, newPriceStr: string) => {
    const price = parseInt(newPriceStr.replace(/\D/g, "")) || 0;
    setChangedPrices(prev => ({ ...prev, [id]: price }));
  };

  const categories = ["Tất cả", ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveAll = async () => {
    if (Object.keys(changedPrices).length === 0) return;
    
    setIsSaving(true);
    try {
      const updatePromises = Object.entries(changedPrices).map(([id, newPrice]) => {
        const product = products.find(p => p.id === id);
        if (product) {
          return productService.update(id, { ...product, price: newPrice });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      alert("Cập nhật giá thành công!");
      setChangedPrices({});
      loadProducts();
    } catch (error) {
      console.error("Error updating prices:", error);
      alert("Có lỗi xảy ra khi cập nhật giá.");
    } finally {
      setIsSaving(false);
    }
  };

  const applyBulkAction = (type: 'percent' | 'amount', value: number) => {
    const newChangedPrices = { ...changedPrices };
    const targetProducts = selectedIds.size > 0 
      ? filteredProducts.filter(p => selectedIds.has(p.id))
      : filteredProducts;

    targetProducts.forEach(p => {
      const currentPrice = changedPrices[p.id] ?? p.price;
      let newPrice = currentPrice;
      if (type === 'percent') {
        newPrice = Math.round(currentPrice * (1 + value / 100));
      } else {
        newPrice = currentPrice + value;
      }
      // Round to nearest 1000 for better pricing
      newPrice = Math.round(newPrice / 1000) * 1000;
      newChangedPrices[p.id] = Math.max(0, newPrice);
    });
    setChangedPrices(newChangedPrices);
    setShowBulkMenu(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <nav className="flex text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">
            <span>Giao dịch</span>
            <span className="mx-2">/</span>
            <span className="text-primary">Hiệu chỉnh giá bán</span>
          </nav>
          <h1 className="text-3xl font-black text-primary-container tracking-tight">Hiệu chỉnh giá bán hàng loạt</h1>
          <p className="text-sm text-on-surface-variant mt-1">Điều chỉnh giá niêm yết cho các sản phẩm trong kho theo lô hàng.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input 
              className="bg-surface-container-highest text-on-surface rounded-lg pl-10 pr-4 py-2 text-sm border border-outline-variant/10 focus:border-primary outline-none transition-all w-64"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest text-on-surface rounded-lg font-bold text-xs transition-all active:scale-95 border border-outline-variant/10">
              <Filter className="w-4 h-4" />
              <span>{selectedCategory}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-xs font-bold hover:bg-surface-container-highest transition-colors",
                    selectedCategory === cat ? "text-primary bg-primary/5" : "text-on-surface-variant"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/10 flex-1 flex flex-col">
        <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
          <div className="flex gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="flex items-center gap-2 text-xs font-bold text-white bg-primary px-4 py-2 rounded-lg transition-all active:scale-95 shadow-md"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Điều chỉnh nhanh</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showBulkMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 z-50 py-2 animate-in fade-in slide-in-from-top-2">
                  <p className="px-4 py-2 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Tăng giá</p>
                  <button onClick={() => applyBulkAction('percent', 5)} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-surface-container-highest text-on-surface">+5%</button>
                  <button onClick={() => applyBulkAction('percent', 10)} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-surface-container-highest text-on-surface">+10%</button>
                  <button onClick={() => applyBulkAction('amount', 10000)} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-surface-container-highest text-on-surface">+10.000đ</button>
                  <div className="h-px bg-outline-variant/10 my-1"></div>
                  <p className="px-4 py-2 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Giảm giá</p>
                  <button onClick={() => applyBulkAction('percent', -5)} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-surface-container-highest text-error">-5%</button>
                  <button onClick={() => applyBulkAction('amount', -10000)} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-surface-container-highest text-error">-10.000đ</button>
                </div>
              )}
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-highest px-3 py-2 rounded-lg transition-colors">
              <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} onClick={loadProducts} />
            </button>
          </div>
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Hiển thị {filteredProducts.length} sản phẩm {Object.keys(changedPrices).length > 0 && `• ${Object.keys(changedPrices).length} thay đổi chưa lưu`}
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-primary-container text-white z-10">
              <tr>
                <th className="px-4 py-4 text-center w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-white/20 text-primary focus:ring-primary bg-transparent"
                    checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-center w-12">#</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest">Mã (ID)</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest">Tên hàng hóa</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-center">ĐVT</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Số lô</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Giá vốn</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-right pr-8">Giá bán hiện tại</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-right pr-8">Giá mới</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-20 text-center text-on-surface-variant italic">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-20 text-center text-on-surface-variant italic">Không tìm thấy sản phẩm nào.</td>
                </tr>
              ) : filteredProducts.map((p, index) => (
                <tr 
                  key={p.id} 
                  className={cn(
                    "hover:bg-surface-container-highest/30 transition-colors group",
                    selectedIds.has(p.id) && "bg-primary/5"
                  )}
                >
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-on-surface-variant text-center">{String(index + 1).padStart(2, "0")}</td>
                  <td className="px-4 py-4 text-xs font-mono text-on-surface-variant">{p.id}</td>
                  <td className="px-4 py-4 text-sm font-bold text-primary-container">{p.name}</td>
                  <td className="px-4 py-4 text-xs text-on-surface-variant text-center">{p.unit}</td>
                  <td className="px-4 py-4 text-xs font-mono text-on-surface-variant text-center">{p.batch || "---"}</td>
                  <td className="px-4 py-4 text-sm font-medium text-on-surface-variant text-right">{formatCurrency(p.costPrice || 0)}</td>
                  <td className="px-4 py-4 text-sm font-medium text-on-surface-variant text-right pr-8">{formatCurrency(p.price)}</td>
                  <td className={cn(
                    "px-4 py-4 text-right pr-4 transition-colors",
                    changedPrices[p.id] !== undefined ? "bg-primary/10" : "bg-primary/5"
                  )}>
                    <div className="flex items-center justify-end gap-2">
                      <input 
                        type="text" 
                        className="w-32 bg-transparent border-b border-primary/20 focus:border-primary text-right font-black text-primary-container text-base outline-none transition-all"
                        value={formatCurrency(changedPrices[p.id] ?? p.price).replace("₫", "").trim()}
                        onChange={(e) => handlePriceChange(p.id, e.target.value)}
                      />
                      {changedPrices[p.id] !== undefined && (
                        <button 
                          onClick={() => {
                            const newChanged = { ...changedPrices };
                            delete newChanged[p.id];
                            setChangedPrices(newChanged);
                          }}
                          className="p-1 text-error hover:bg-error/10 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
          <div className="text-sm">
            {Object.keys(changedPrices).length > 0 && (
              <span className="font-bold text-primary">
                Đang có {Object.keys(changedPrices).length} sản phẩm được thay đổi giá
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setChangedPrices({})}
              disabled={Object.keys(changedPrices).length === 0 || isSaving}
              className="px-8 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-highest transition-all active:scale-95 disabled:opacity-50"
            >
              Hủy thay đổi
            </button>
            <button 
              onClick={handleSaveAll}
              disabled={Object.keys(changedPrices).length === 0 || isSaving}
              className="px-8 py-2.5 rounded-xl font-bold text-sm bg-primary-container text-white shadow-lg shadow-primary-container/20 hover:brightness-110 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Đang lưu..." : "Cập nhật giá bán"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

