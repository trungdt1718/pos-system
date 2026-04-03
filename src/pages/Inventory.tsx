import React, { useEffect, useState } from "react";
import { 
  Warehouse, 
  Search, 
  Filter, 
  Download, 
  RefreshCcw, 
  AlertTriangle, 
  Calendar,
  Package,
  History,
  ArrowRightLeft,
  PlusCircle
} from "lucide-react";
import { cn } from "../lib/utils";
import { formatCurrency } from "../lib/utils";
import { productService } from "../services/api";
import { Product } from "../types";

export default function Inventory() {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    setLoading(true);
    productService.getAll().then(res => {
      setInventory(res.data);
      if (res.data.length > 0) {
        setSelectedItem(res.data[0]);
      }
      setLoading(false);
    });
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.batch && item.batch.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatus = (item: Product) => {
    const minStock = 20; // Default min stock
    if (item.stock <= 0) return "Hết hàng";
    if (item.stock <= minStock) return "Sắp hết hàng";
    return "Bình thường";
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 py-6 flex justify-between items-end">
        <div>
          <nav className="flex text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">
            <span>Hệ thống</span>
            <span className="mx-2">/</span>
            <span className="text-primary">Quản lý kho hàng</span>
          </nav>
          <h1 className="text-3xl font-black text-primary-container tracking-tight">Kho hàng</h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-highest text-on-surface flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all active:scale-95">
            <ArrowRightLeft className="w-4 h-4" /> Kiểm kho
          </button>
          <button className="bg-gradient-to-br from-primary to-primary-container text-white flex items-center gap-2 px-6 py-2 rounded-md font-bold text-sm transition-all active:scale-95 shadow-md">
            <PlusCircle className="w-4 h-4" /> Nhập hàng
          </button>
        </div>
      </div>

      <div className="flex-1 flex px-8 pb-8 gap-6 overflow-hidden">
        <div className="w-3/5 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
          <div className="p-4 bg-surface flex justify-between items-center border-b border-outline-variant/10">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input 
                className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary/50 focus:ring-0 rounded-lg pl-10 pr-4 py-2 text-sm" 
                placeholder="Tìm theo mã, tên, lô hàng..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors">
                <Filter className="w-5 h-5" />
              </button>
              <button 
                onClick={loadInventory}
                className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors"
              >
                <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-low/95 backdrop-blur-md z-10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Mặt hàng</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Tồn kho</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">ĐVT</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tình trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-on-surface-variant italic">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-on-surface-variant italic">Không tìm thấy mặt hàng nào.</td>
                  </tr>
                ) : filteredInventory.map((item) => {
                  const status = getStatus(item);
                  return (
                    <tr 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={cn(
                        "hover:bg-surface-container-highest/50 cursor-pointer transition-colors group",
                        selectedItem?.id === item.id && "bg-primary/5 border-l-4 border-primary"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-primary-container">{item.name}</span>
                          <span className="text-[10px] text-on-surface-variant font-mono uppercase">{item.id} • {item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "text-sm font-black",
                          status === "Sắp hết hàng" || status === "Hết hàng" ? "text-error" : "text-primary"
                        )}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant text-center">{item.unit}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 text-[10px] font-bold uppercase rounded-full",
                          status === "Bình thường" ? "bg-secondary-container text-on-secondary-container" : 
                          status === "Sắp hết hàng" ? "bg-error-container text-on-error-container" :
                          "bg-tertiary-container text-on-tertiary-container"
                        )}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-2/5 flex flex-col gap-6 overflow-hidden">
          {selectedItem ? (
            <>
              <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-primary-container/5 overflow-hidden flex flex-col">
                <div className="bg-primary-container px-6 py-4 flex items-center justify-between">
                  <h3 className="text-white font-bold tracking-tight">Chi tiết tồn kho</h3>
                  <Warehouse className="text-white w-5 h-5" />
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center border border-outline-variant/10">
                      <Package className="text-primary w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-primary-container leading-tight">{selectedItem.name}</h4>
                      <p className="text-xs text-on-surface-variant font-mono uppercase">{selectedItem.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Số lô hàng</p>
                      <p className="text-sm font-black text-primary-container font-mono">{selectedItem.batch || "---"}</p>
                    </div>
                    <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Hạn sử dụng</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-on-surface-variant" />
                        <p className="text-sm font-black text-primary-container">{selectedItem.expiry || "---"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mức tồn kho hiện tại</span>
                      <span className="text-2xl font-black text-primary tracking-tighter">{selectedItem.stock} <span className="text-xs font-bold uppercase">{selectedItem.unit}</span></span>
                    </div>
                    <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          getStatus(selectedItem) === "Sắp hết hàng" ? "bg-error" : "bg-primary"
                        )}
                        style={{ width: `${Math.min((selectedItem.stock / 100) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      <span>Mức tối thiểu: 20</span>
                      <span>An toàn: 50</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/30">
                  <h3 className="text-xs font-black text-primary-container uppercase tracking-widest flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Lịch sử xuất nhập
                  </h3>
                  <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Xem tất cả</button>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-3 custom-scrollbar">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/5">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        i === 1 ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"
                      )}>
                        {i === 1 ? <RefreshCcw className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-on-surface">{i === 1 ? "Nhập kho bổ sung" : "Xuất kho bán hàng"}</p>
                        <p className="text-[10px] text-on-surface-variant">02/04/2026 • HD-99283</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-xs font-black", i === 1 ? "text-primary" : "text-error")}>
                          {i === 1 ? "+20" : "-5"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-on-surface-variant italic text-sm bg-surface-container-lowest rounded-xl border border-outline-variant/10">
              Chọn mặt hàng để xem chi tiết
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
