import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  ArrowRight, 
  ShoppingCart, 
  Barcode, 
  ClipboardList,
  AlertTriangle,
  BarChart3,
  Settings
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { invoiceService, productService, customerService } from "../services/api";
import { Invoice, Product, Customer } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const chartData = [
  { name: "01/10", value: 40, sub: 80 },
  { name: "02/10", value: 30, sub: 60 },
  { name: "03/10", value: 60, sub: 90 },
  { name: "04/10", value: 25, sub: 70 },
  { name: "05/10", value: 55, sub: 80 },
  { name: "06/10", value: 75, sub: 100 },
];

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    invoiceService.getAll().then(res => setInvoices(res.data));
    productService.getAll().then(res => setProducts(res.data));
    customerService.getAll().then(res => setCustomers(res.data));
  }, []);

  const todayRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  const handleQuickAction = (label: string) => {
    switch (label) {
      case "Tạo Đơn":
      case "Quét Mã":
        navigate("/pos");
        break;
      case "Nhập Kho":
      case "Kiểm kê":
        navigate("/inventory");
        break;
      case "Báo cáo":
        navigate("/reports");
        break;
      case "Chỉnh giá":
        navigate("/price-adjustment");
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Doanh thu hôm nay" 
          value={formatCurrency(todayRevenue)} 
          trend="+12.5%" 
          icon={TrendingUp} 
          color="primary" 
          onClick={() => navigate("/reports")}
        />
        <KPICard 
          title="Đơn hàng mới" 
          value={`${invoices.length} Đơn`} 
          trend="+8%" 
          icon={ShoppingBag} 
          color="tertiary" 
          onClick={() => navigate("/orders")}
        />
        <KPICard 
          title="Tồn kho hiện tại" 
          value={`${totalStock} SP`} 
          trend="-2.1%" 
          icon={Package} 
          color="blue" 
          trendColor="error"
          onClick={() => navigate("/inventory")}
        />
        <KPICard 
          title="Khách hàng mới" 
          value={`${customers.length} TV`} 
          trend="+15%" 
          icon={Users} 
          color="purple" 
          onClick={() => navigate("/customers")}
        />
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        {/* Quick Actions */}
        <div className="order-1 lg:order-2 col-span-12 lg:col-span-4 bg-primary-container rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-lg font-black uppercase tracking-tight mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton icon={ShoppingCart} label="Tạo Đơn" onClick={() => handleQuickAction("Tạo Đơn")} primary />
              <QuickActionButton icon={Package} label="Nhập Kho" onClick={() => handleQuickAction("Nhập Kho")} />
              <QuickActionButton icon={BarChart3} label="Báo cáo" onClick={() => handleQuickAction("Báo cáo")} />
              <QuickActionButton icon={Settings} label="Chỉnh giá" onClick={() => handleQuickAction("Chỉnh giá")} />
            </div>
            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-2">Thông báo mới nhất</p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-tertiary-container/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-tertiary-container w-4 h-4" />
                </div>
                <p className="text-xs leading-relaxed font-bold">Sản phẩm <span className="text-tertiary-container">"Sữa đặc ABC"</span> sắp hết hàng (Còn 5 sp).</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary-container/50 rounded-full blur-2xl"></div>
        </div>

        {/* Chart */}
        <div className="order-2 lg:order-1 col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-outline-variant/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-lg font-black text-on-surface uppercase tracking-tight">Theo dõi kho (Nhập/Xuất)</h2>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Dữ liệu cập nhật thời gian thực</p>
            </div>
            <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl">
              <button className="text-[10px] font-black px-3 py-1.5 bg-white text-primary rounded-lg shadow-sm">Tháng này</button>
            </div>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#adb5bd" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#adb5bd" }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                />
                <Bar dataKey="sub" fill="#1e3a8a08" radius={[6, 6, 0, 0]} />
                <Bar dataKey="value" fill="#00236f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-span-12 bg-surface-container-lowest rounded-xl p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-on-surface">Đơn hàng vừa thực hiện</h2>
            <button onClick={() => navigate("/orders")} className="text-xs font-bold text-primary flex items-center gap-1 group">
              Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant rounded-l-lg">Mã đơn</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Khách hàng</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Sản phẩm</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Thời gian</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tổng tiền</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant rounded-r-lg text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 font-bold text-primary-container">{inv.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                          {inv.customerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium">{inv.customerName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{inv.products}</td>
                    <td className="p-4 text-xs text-on-surface-variant">{inv.time}</td>
                    <td className="p-4 text-sm font-black">{formatCurrency(inv.total)}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, icon: Icon, color, trendColor = "green", onClick }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "bg-surface-container-lowest p-6 rounded-xl border-none shadow-sm flex flex-col justify-between transition-all active:scale-95",
        onClick && "cursor-pointer hover:shadow-md"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-lg", `bg-${color}/10`)}>
          <Icon className={cn("w-5 h-5", `text-${color}`)} />
        </div>
        <span className={cn("text-xs font-bold px-2 py-1 rounded-md", trendColor === "green" ? "text-green-600 bg-green-50" : "text-error bg-error-container/30")}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-on-surface">{value}</h3>
      </div>
    </motion.div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick, primary }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-4 backdrop-blur-md rounded-2xl hover:brightness-110 transition-all group w-full",
        primary ? "bg-white text-primary" : "bg-white/10 text-white"
      )}
    >
      <Icon className={cn("mb-2 w-6 h-6 group-hover:scale-110 transition-transform", primary ? "text-primary" : "text-white")} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
