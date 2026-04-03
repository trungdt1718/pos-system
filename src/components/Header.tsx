import React from "react";
import { Search, Bell, Settings, UserCircle } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-40 border-b border-outline-variant/5">
      <div className="flex items-center space-x-6">
        <h1 className="text-2xl font-bold text-primary-container">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:ring-1 focus:ring-primary/15 transition-all"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors">
            <UserCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
