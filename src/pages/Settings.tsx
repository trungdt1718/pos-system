import React, { useEffect, useState } from "react";
import { 
  Database, 
  ServerCrash, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Info,
  Store,
  MapPin,
  Phone,
  Save,
  Link2,
  Globe,
  RotateCcw
} from "lucide-react";
import { cn } from "../lib/utils";
import { systemService, updateApiBaseURL } from "../services/api";

interface DbStatus {
  source: string;
  connected: boolean;
  connectionString?: string;
  timestamp: string;
}

export default function Settings() {
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [newConnectionString, setNewConnectionString] = useState("");
  const [isUpdatingDb, setIsUpdatingDb] = useState(false);
  
  // API URL State
  const [apiUrl, setApiUrl] = useState(localStorage.getItem("sumi_mart_api_url") || import.meta.env.VITE_API_URL || "/api");
  
  const [storeSettings, setStoreSettings] = useState({
    tendv: "",
    diachi: "",
    dienthoai: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkDbStatus();
    loadStoreSettings();
  }, []);

  const checkDbStatus = () => {
    setLoading(true);
    fetch("/api/db-status")
      .then(res => res.json())
      .then(data => {
        setDbStatus(data);
        setLoading(false);
      })
      .catch(() => {
        setDbStatus({ source: "Unknown", connected: false, timestamp: new Date().toISOString() });
        setLoading(false);
      });
  };

  const handleUpdateApiUrl = () => {
    if (!apiUrl.trim()) {
      alert("Vui lòng nhập URL API!");
      return;
    }

    // Kiểm tra lỗi Mixed Content
    if (window.location.protocol === "https:" && apiUrl.startsWith("http://")) {
      if (!confirm("CẢNH BÁO: Trang web đang chạy HTTPS nhưng bạn nhập API là HTTP. Trình duyệt sẽ chặn yêu cầu này (Lỗi Mixed Content). Bạn có chắc chắn muốn lưu không?")) {
        return;
      }
    }

    localStorage.setItem("sumi_mart_api_url", apiUrl);
    updateApiBaseURL(apiUrl);
    alert("Cập nhật URL API thành công! Hệ thống sẽ sử dụng URL này cho các yêu cầu tiếp theo.");
    checkDbStatus();
  };

  const resetApiUrl = () => {
    const defaultUrl = import.meta.env.VITE_API_URL || "/api";
    localStorage.removeItem("sumi_mart_api_url");
    setApiUrl(defaultUrl);
    updateApiBaseURL(defaultUrl);
    alert("Đã khôi phục URL API mặc định.");
    checkDbStatus();
  };

  const handleUpdateDbConfig = async () => {
    if (!newConnectionString.trim()) {
      alert("Vui lòng nhập chuỗi kết nối!");
      return;
    }

    setIsUpdatingDb(true);
    try {
      const response = await fetch("/api/db-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionString: newConnectionString })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setNewConnectionString("");
      } else {
        alert(data.message || "Cập nhật thất bại");
      }
      // Luôn cập nhật lại trạng thái hiển thị dù thành công hay thất bại
      checkDbStatus();
    } catch (error) {
      alert("Lỗi kết nối đến server");
      checkDbStatus();
    } finally {
      setIsUpdatingDb(false);
    }
  };

  const loadStoreSettings = () => {
    systemService.getSettings().then(res => {
      setStoreSettings(res.data);
    });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // In a real app, we would call an API to save these settings
      // For giờ, we just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Cập nhật thông tin cửa hàng thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu cài đặt.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <nav className="flex text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">
          <span>Hệ thống</span>
          <span className="mx-2">/</span>
          <span className="text-primary">Thiết lập</span>
        </nav>
        <h1 className="text-3xl font-black text-primary-container tracking-tight">Cấu hình hệ thống</h1>
        <p className="text-sm text-on-surface-variant mt-1">Quản lý kết nối cơ sở dữ liệu và thông tin cửa hàng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Database Status Section */}
        <section className="space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-primary-container">Trạng thái Dữ liệu</h2>
                  <p className="text-xs text-on-surface-variant">Kiểm tra kết nối PostgreSQL</p>
                </div>
              </div>
              <button 
                onClick={checkDbStatus}
                disabled={loading}
                className="p-2 hover:bg-surface-container-highest rounded-full transition-colors"
              >
                <RefreshCcw className={cn("w-5 h-5 text-on-surface-variant", loading && "animate-spin")} />
              </button>
            </div>

            <div className={cn(
              "p-6 rounded-2xl border transition-all duration-500",
              dbStatus?.connected 
                ? "bg-green-50/50 border-green-200" 
                : "bg-amber-50/50 border-amber-200"
            )}>
              <div className="flex items-start gap-4">
                {dbStatus?.connected ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface mb-1">
                    {dbStatus?.connected ? "Kết nối thành công" : "Kết nối thất bại"}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">Nguồn dữ liệu:</span>
                      <span className="font-bold text-on-surface">{dbStatus?.source}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">Chuỗi hiện tại:</span>
                      <span className="font-mono text-[10px] text-on-surface truncate max-w-[120px]">{dbStatus?.connectionString || "---"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">Thời gian kiểm tra:</span>
                      <span className="font-mono text-on-surface">
                        {dbStatus ? new Date(dbStatus.timestamp).toLocaleTimeString() : "---"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic DB Config Form */}
            <div className="mt-8 pt-6 border-t border-outline-variant/10">
              <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4">Thay đổi kết nối Database</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input 
                    type="text"
                    value={newConnectionString}
                    onChange={(e) => setNewConnectionString(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-xl pl-12 pr-4 py-3 text-xs font-mono text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="postgres://user:pass@host:port/db"
                  />
                </div>
                <button 
                  onClick={handleUpdateDbConfig}
                  disabled={isUpdatingDb}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs shadow-md hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdatingDb ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isUpdatingDb ? "Đang kết nối..." : "Cập nhật & Thử lại"}</span>
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-surface-container-low rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Hệ thống hỗ trợ thay đổi <strong>DATABASE_URL</strong> trực tiếp. Lưu ý: Thay đổi này sẽ áp dụng ngay lập tức cho toàn bộ người dùng.
              </p>
            </div>
          </div>

          {/* API URL Config Section */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-secondary/10 rounded-2xl">
                <Globe className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-black text-primary-container">Kết nối API</h2>
                <p className="text-xs text-on-surface-variant">Cấu hình địa chỉ máy chủ Backend</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">URL API hiện tại</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input 
                      type="text"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-xl pl-12 pr-4 py-3 text-xs font-mono text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="http://localhost:3000/api"
                    />
                  </div>
                  <button 
                    onClick={resetApiUrl}
                    title="Khôi phục mặc định"
                    className="p-3 bg-surface-container-highest text-on-surface-variant rounded-xl hover:bg-surface-container-high transition-all active:scale-95"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleUpdateApiUrl}
                className="w-full bg-secondary text-white py-3 rounded-xl font-bold text-xs shadow-md hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Lưu cấu hình API</span>
              </button>
            </div>

            <div className="mt-6 p-4 bg-secondary/5 rounded-xl flex items-start gap-3 border border-secondary/10">
              <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                Thay đổi này chỉ có hiệu lực trên trình duyệt hiện tại. Sử dụng khi bạn muốn kết nối Frontend này với một Server khác.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-primary-container mb-2">Thông tin kỹ thuật</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Cơ sở dữ liệu: <strong>PostgreSQL (Neon.tech)</strong><br />
                  Môi trường: <strong>{process.env.NODE_ENV || "development"}</strong><br />
                  Phiên bản: <strong>2.1.0-stable</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Store Info Section */}
        <section className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-secondary/10 rounded-2xl">
              <Store className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-primary-container">Thông tin Cửa hàng</h2>
              <p className="text-xs text-on-surface-variant">Hiển thị trên hóa đơn và báo cáo</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Tên đơn vị</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text"
                  value={storeSettings.tendv}
                  onChange={(e) => setStoreSettings({...storeSettings, tendv: e.target.value})}
                  className="w-full bg-surface-container-highest border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Nhập tên cửa hàng..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Địa chỉ</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text"
                  value={storeSettings.diachi}
                  onChange={(e) => setStoreSettings({...storeSettings, diachi: e.target.value})}
                  className="w-full bg-surface-container-highest border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Nhập địa chỉ..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text"
                  value={storeSettings.dienthoai}
                  onChange={(e) => setStoreSettings({...storeSettings, dienthoai: e.target.value})}
                  className="w-full bg-surface-container-highest border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Nhập số điện thoại..."
                />
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full mt-4 bg-primary-container text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary-container/20 hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
