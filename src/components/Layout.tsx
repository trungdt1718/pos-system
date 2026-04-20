import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ShoppingCart, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isPOS = location.pathname === "/pos";

  if (isPOS) {
    return <Outlet />;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className={cn(
        "transition-all duration-300 min-h-screen",
        "lg:pl-64"
      )}>
        <Header 
          title={getPageTitle(location.pathname)} 
          onMenuClick={toggleSidebar}
        />
        <main className="pt-20 md:pt-24 px-4 md:px-8 pb-32 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Global FAB for Mobile */}
      <AnimatePresence>
        {!isPOS && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 50 }}
            onClick={() => navigate("/pos")}
            className="fixed bottom-6 right-6 z-50 lg:hidden flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full shadow-[0_10px_25px_rgba(0,35,111,0.3)] border-4 border-white active:scale-90 transition-all group"
          >
            <div className="relative">
              <ShoppingCart className="w-7 h-7" />
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                <Plus className="text-secondary w-3 h-3 font-black" />
              </div>
            </div>
            {/* Tooltip-like label */}
            <span className="absolute -top-10 right-0 bg-primary-container text-white text-[10px] font-black px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl uppercase tracking-widest opacity-0 group-active:opacity-100 transition-opacity">
              Tạo đơn ngay
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Helper to keep imports clean
import { cn } from "../lib/utils";

function getPageTitle(pathname: string) {
  switch (pathname) {
    case "/": return "Tổng quan hệ thống";
    case "/staff": return "Quản lý nhân sự";
    case "/products": return "Danh mục hàng hóa";
    case "/customers": return "Quản lý khách hàng";
    case "/inventory": return "Quản lý kho hàng";
    case "/orders": return "Lịch sử đơn hàng";
    case "/reports": return "Báo cáo thống kê";
    case "/settings": return "Thiết lập hệ thống";
    case "/price-adjustment": return "Hiệu chỉnh giá bán";
    default: return "Sumi.Mart";
  }
}
