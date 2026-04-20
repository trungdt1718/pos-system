import React, { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  RefreshCcw
} from "lucide-react";
import { cn } from "../lib/utils";
import { formatCurrency } from "../lib/utils";
import { productService, invoiceService, customerService } from "../services/api";
import { Product, Invoice, Customer } from "../types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Reports() {
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, iRes, cRes] = await Promise.all([
        productService.getAll(),
        invoiceService.getAll(),
        customerService.getAll()
      ]);
      setProducts(pRes.data);
      setInvoices(iRes.data);
      setCustomers(cRes.data);
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOrders = invoices.length;
  const totalCustomers = customers.length;
  const totalProfit = totalRevenue * 0.25; // Mock profit calculation

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  products.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  // Mock sales trend (using real total distributed across days)
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const salesTrend = days.map((day, i) => {
    const factor = [0.1, 0.12, 0.08, 0.15, 0.18, 0.22, 0.15][i];
    return {
      name: day,
      sales: totalRevenue * factor,
      profit: totalRevenue * factor * 0.25
    };
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <nav className="flex text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1 md:mb-2 text-center md:text-left">
            <span>Hệ thống</span>
            <span className="mx-1 md:mx-2">/</span>
            <span className="text-primary">Báo cáo thống kê</span>
          </nav>
          <h1 className="text-xl md:text-3xl font-black text-primary-container tracking-tight text-center md:text-left uppercase">Báo cáo doanh thu</h1>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={loadData}
            className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors flex items-center justify-center bg-surface-container-low md:bg-transparent"
          >
            <RefreshCcw className={cn("w-4 h-4 md:w-5 md:h-5", loading && "animate-spin")} />
          </button>
          <button className="flex-1 md:flex-none bg-surface-container-highest text-on-surface flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-md font-bold text-[10px] md:text-sm transition-all active:scale-95 whitespace-nowrap">
            <Calendar className="w-3 h-3 md:w-4 md:h-4" /> Tuần này
          </button>
          <button className="flex-1 md:flex-none bg-gradient-to-br from-primary to-primary-container text-white flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-md font-bold text-[10px] md:text-sm transition-all active:scale-95 shadow-md whitespace-nowrap">
            <Download className="w-3 h-3 md:w-4 md:h-4" /> Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 md:px-8 pb-8 space-y-4 md:space-y-6 custom-scrollbar">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <MetricCard 
            title="Tổng doanh thu" 
            value={formatCurrency(totalRevenue)} 
            change="+12.5%" 
            isPositive={true} 
            icon={DollarSign}
            color="bg-primary"
          />
          <MetricCard 
            title="Tổng đơn hàng" 
            value={totalOrders.toLocaleString()} 
            change="+8.2%" 
            isPositive={true} 
            icon={ShoppingCart}
            color="bg-secondary"
          />
          <MetricCard 
            title="Khách hàng" 
            value={totalCustomers.toLocaleString()} 
            change="+5.4%" 
            isPositive={true} 
            icon={Users}
            color="bg-tertiary"
          />
          <MetricCard 
            title="Lợi nhuận" 
            value={formatCurrency(totalProfit)} 
            change="+15.1%" 
            isPositive={true} 
            icon={TrendingUp}
            color="bg-success"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-4 md:p-6 flex flex-col h-[300px] md:h-[400px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-2">
              <h3 className="text-[10px] md:text-sm font-black text-primary-container uppercase tracking-widest">Biểu đồ doanh thu & Lợi nhuận</h3>
              <div className="flex gap-3 md:gap-4">
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary"></div>
                  <span className="text-[8px] md:text-[10px] font-bold text-on-surface-variant uppercase">Doanh thu</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-secondary"></div>
                  <span className="text-[8px] md:text-[10px] font-bold text-on-surface-variant uppercase">Lợi nhuận</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0061A4" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0061A4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fontWeight: 700, fill: "#666" }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fontWeight: 700, fill: "#666" }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#0061A4" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="profit" stroke="#00C49F" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-4 md:p-6 flex flex-col h-[300px] md:h-[400px]">
            <h3 className="text-[10px] md:text-sm font-black text-primary-container uppercase tracking-widest mb-4 md:mb-6">Cơ cấu mặt hàng</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={window.innerWidth < 768 ? 40 : 60}
                    outerRadius={window.innerWidth < 768 ? 60 : 80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => <span className="text-[8px] md:text-[10px] font-bold text-on-surface-variant uppercase">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-8">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-4 md:p-6 h-[300px] md:h-[350px] flex flex-col">
            <h3 className="text-[10px] md:text-sm font-black text-primary-container uppercase tracking-widest mb-4 md:mb-6">Top sản phẩm tồn kho</h3>
            <div className="flex-1 space-y-3 md:space-y-4 overflow-auto custom-scrollbar pr-2">
              {products.sort((a, b) => b.stock - a.stock).slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-surface-container-low rounded-xl border border-outline-variant/5">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] md:text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] md:text-xs font-bold text-on-surface leading-tight">{item.name}</p>
                    <p className="text-[8px] text-on-surface-variant uppercase font-bold">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] md:text-xs font-black text-primary-container">{item.stock} {item.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-4 md:p-6 h-[300px] md:h-[350px] flex flex-col">
            <h3 className="text-[10px] md:text-sm font-black text-primary-container uppercase tracking-widest mb-4 md:mb-6">Phân bổ giá bán</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={products.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 7, fontWeight: 700, fill: "#666" }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fontWeight: 700, fill: "#666" }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="price" fill="#0061A4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, isPositive, icon: Icon, color }: any) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant/10 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
      <div className={cn("absolute -top-6 -right-6 w-20 h-20 md:w-24 md:h-24 rounded-full opacity-5 group-hover:scale-110 transition-transform", color)}></div>
      <div className="flex justify-between items-start mb-2 md:mb-4">
        <div className={cn("p-2 md:p-3 rounded-xl text-white shadow-lg shadow-primary/10", color)}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase",
          isPositive ? "bg-success/10 text-success" : "bg-error/10 text-error"
        )}>
          {isPositive ? <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <ArrowDownRight className="w-2.5 h-2.5 md:w-3 md:h-3" />}
          {change}
        </div>
      </div>
      <p className="text-[8px] md:text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5 md:mb-1">{title}</p>
      <p className="text-lg md:text-2xl font-black text-primary-container tracking-tight">{value}</p>
    </div>
  );
}
