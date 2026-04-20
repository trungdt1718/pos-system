import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isPOS = location.pathname === "/pos";

  if (isPOS) {
    return <Outlet />;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
        <main className="pt-20 md:pt-24 px-4 md:px-8 pb-8">
          <Outlet />
        </main>
      </div>

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
