import React from "react";
import { Search, Bell, Settings, UserCircle, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-40 border-b border-outline-variant/5">
      <div className="flex items-center space-x-2 md:space-x-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg md:text-2xl font-bold text-primary-container truncate max-w-[150px] md:max-w-none">{title}</h1>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-32 md:w-64 focus:ring-1 focus:ring-primary/15 transition-all"
          />
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
          </button>
          <button className="hidden xs:block p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors">
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
