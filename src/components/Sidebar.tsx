import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  BarChart3, 
  Settings, 
  LogOut,
  Store
} from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Tổng quan", path: "/" },
  { icon: Users, label: "Nhân viên", path: "/staff" },
  { icon: Package, label: "Sản phẩm", path: "/products" },
  { icon: ShoppingCart, label: "Đơn hàng", path: "/orders" },
  { icon: Users, label: "Khách hàng", path: "/customers" },
  { icon: Warehouse, label: "Kho hàng", path: "/inventory" },
  { icon: BarChart3, label: "Báo cáo", path: "/reports" },
  { icon: Settings, label: "Chỉnh giá", path: "/price-adjustment" },
];

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-6 z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
          <Store className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-primary-container tracking-tighter">Sumi.Mart</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant opacity-70">Hệ thống quản trị</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center px-4 py-3 rounded-lg transition-all duration-200 group",
              isActive 
                ? "bg-primary text-white shadow-md scale-95" 
                : "text-on-surface-variant hover:bg-surface-container-highest"
            )}
          >
            <item.icon className={cn("w-5 h-5 mr-3 transition-transform group-hover:scale-110")} />
            <span className="uppercase tracking-wider font-semibold text-xs">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 pt-4 border-t border-outline-variant/10">
        <div className="flex items-center gap-3 p-2 bg-surface-container rounded-xl">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD43uD9bcjjR5URX--1K9-LKAHTgTmVamMZbr4m04Ua7p1KqnaLo6o4xi1HYTsyBhmBuaeWZc2pscgXcFTkpiEBwp_GKWNoivTWB-K7lOlEAkPBwJ3UUJeHZoRd4rQVuMzV-hP_VsHeSL4dzSymLQclVr-3diBJDoMF8fcVelm1E-21QksbBldHGCuQTPtT0FHwzC_XFgReaIp3mmYVqAOYnJWSdKP7u2IEahmPD8AVuu4WfJl6PtAdhk9kyNTOudVic_VyVKDvkk-i"
            alt="Admin Avatar"
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-on-surface truncate">Admin Sumi</p>
            <p className="text-[10px] text-on-surface-variant truncate">Quản trị hệ thống</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-error hover:bg-error/10 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
