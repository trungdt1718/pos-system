import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const location = useLocation();
  const isPOS = location.pathname === "/pos";

  if (isPOS) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="pl-64">
        <Header title={getPageTitle(location.pathname)} />
        <main className="pt-24 px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string) {
  switch (pathname) {
    case "/": return "Tổng quan hệ thống";
    case "/staff": return "Quản lý nhân sự";
    case "/products": return "Danh mục hàng hóa";
    case "/customers": return "Quản lý khách hàng";
    case "/inventory": return "Quản lý kho hàng";
    case "/orders": return "Lịch sử đơn hàng";
    case "/reports": return "Báo cáo thống kê";
    case "/price-adjustment": return "Hiệu chỉnh giá bán";
    default: return "Sumi.Mart";
  }
}
