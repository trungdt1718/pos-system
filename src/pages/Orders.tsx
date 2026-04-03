import React, { useEffect, useState } from "react";
import { invoiceService } from "../services/api";
import { Invoice } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { Search, Filter, Download, Trash2, Eye, FileText } from "lucide-react";
import { motion } from "motion/react";

export default function Orders() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    invoiceService.getAll().then(res => {
      setInvoices(res.data);
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${id}?`)) {
      invoiceService.delete(id).then(() => {
        alert("Xóa đơn hàng thành công!");
        loadInvoices();
      });
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-container">Lịch sử đơn hàng</h1>
          <p className="text-sm text-on-surface-variant">Quản lý và theo dõi tất cả các giao dịch đã thực hiện</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant/30 rounded-lg text-sm font-bold hover:bg-surface-container-highest transition-colors">
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
        <div className="p-4 border-b border-outline-variant/10 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input 
              className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/15 rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none text-sm" 
              placeholder="Tìm theo mã đơn hoặc tên khách hàng..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-surface-container-low rounded-lg border border-outline-variant/10 hover:bg-surface-container-high transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Mã đơn</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Khách hàng</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Sản phẩm</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Thời gian</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tổng tiền</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Trạng thái</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-4 font-bold text-primary-container">{inv.id}</td>
                  <td className="p-4 text-sm font-medium">{inv.customerName}</td>
                  <td className="p-4 text-sm max-w-xs truncate">{inv.products}</td>
                  <td className="p-4 text-xs text-on-surface-variant">{inv.time}</td>
                  <td className="p-4 text-sm font-black">{formatCurrency(inv.total)}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md">
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Xem chi tiết">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors" title="In lại hóa đơn">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(inv.id)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors" 
                        title="Xóa đơn hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
