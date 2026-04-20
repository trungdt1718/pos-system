import React, { useEffect, useState } from "react";
import { customerService } from "../services/api";
import { Customer } from "../types";
import { formatCurrency, cn } from "../lib/utils";
import { Filter, Download, Mail, Phone, Camera, Edit, Trash2, Plus, X, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: "",
    gender: "Nam",
    birthday: "1990-01-01",
    phone: "",
    email: "",
    address: "",
    totalSpent: 0
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    customerService.getAll().then(res => {
      setCustomers(res.data);
      if (res.data.length > 0 && !selectedCustomer && !isAdding) {
        setSelectedCustomer(res.data[0]);
      }
    });
  };

  const handleUpdate = () => {
    if (selectedCustomer && !isSubmitting) {
      setIsSubmitting(true);
      customerService.update(selectedCustomer.id, selectedCustomer).then(() => {
        loadCustomers();
        showNotification("Cập nhật khách hàng thành công!");
      }).catch(err => {
        console.error(err);
        showNotification("Lỗi khi cập nhật khách hàng", "error");
      }).finally(() => setIsSubmitting(false));
    }
  };

  const handleDelete = () => {
    if (selectedCustomer && !isSubmitting) {
      if (confirm(`Bạn có chắc chắn muốn xóa khách hàng ${selectedCustomer.name}?`)) {
        setIsSubmitting(true);
        customerService.delete(selectedCustomer.id).then(() => {
          setSelectedCustomer(null);
          loadCustomers();
          showNotification("Đã xóa khách hàng!");
        }).catch(err => {
          console.error(err);
          showNotification("Lỗi khi xóa khách hàng", "error");
        }).finally(() => setIsSubmitting(false));
      }
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setSelectedCustomer(null);
    setFormData({
      name: "",
      gender: "Nam",
      birthday: "1990-01-01",
      phone: "",
      email: "",
      address: "",
      totalSpent: 0
    });
  };

  const handleSaveNew = () => {
    if (!formData.name) return showNotification("Vui lòng nhập tên khách hàng!", "error");
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    customerService.create(formData).then((res) => {
      setIsAdding(false);
      loadCustomers();
      setSelectedCustomer(res.data);
      showNotification("Thêm khách hàng mới thành công!");
    }).catch(err => {
      console.error(err);
      showNotification("Lỗi khi thêm khách hàng", "error");
    }).finally(() => setIsSubmitting(false));
  };

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-112px)] gap-6">
      <section className="flex-[1.5] bg-surface-container-lowest rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 flex justify-between items-end border-b border-surface-container-low">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-primary">Khách hàng</h2>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Hiển thị {customers.length} khách hàng</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-all">
              <Filter className="text-primary w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button className="p-2 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-all">
              <Download className="text-primary w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="min-w-[700px] lg:min-w-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Mã KH</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Họ tên</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Giới tính</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ngày sinh</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {customers.map((customer) => (
                  <tr 
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setIsAdding(false);
                      if (window.innerWidth < 1024) {
                        document.getElementById('customer-detail')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={cn(
                      "hover:bg-surface-container-low/50 transition-colors cursor-pointer group",
                      selectedCustomer?.id === customer.id && !isAdding && "bg-primary/5 border-l-4 border-primary"
                    )}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-primary-container font-bold">{customer.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-background">{customer.name}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 text-[10px] font-bold rounded uppercase",
                        customer.gender === "Nam" ? "bg-secondary-container text-on-secondary-container" : "bg-tertiary-fixed text-on-tertiary-fixed"
                      )}>
                        {customer.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{customer.birthday}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary text-right">{formatCurrency(customer.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="customer-detail" className="flex-1 bg-surface-container-lowest rounded-xl flex flex-col shadow-sm overflow-hidden border-l-4 border-primary">
        <div className="p-6 bg-surface-container-low">
          <h2 className="text-xl font-bold tracking-tight text-primary-container">
            {isAdding ? "Thêm khách hàng mới" : "Thông tin khách hàng"}
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">
            {isAdding ? "Nhập thông tin khách hàng mới" : "Chi tiết hồ sơ khách hàng"}
          </p>
        </div>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          {isAdding ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 md:gap-y-6">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Họ tên</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-2 px-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20" 
                  placeholder="Nhập họ tên khách hàng..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Giới tính</label>
                <select 
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Ngày sinh</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20" 
                  type="date" 
                  value={formData.birthday}
                  onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Điện thoại</label>
                <div className="flex items-center bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <Phone className="text-slate-400 ml-3 w-4 h-4" />
                  <input 
                    className="w-full bg-transparent border-none py-2 px-3 text-sm font-medium focus:ring-0" 
                    placeholder="090..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Email</label>
                <div className="flex items-center bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <Mail className="text-slate-400 ml-3 w-4 h-4" />
                  <input 
                    className="w-full bg-transparent border-none py-2 px-3 text-sm font-medium focus:ring-0" 
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Địa chỉ</label>
                <textarea 
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 border-none resize-none" 
                  rows={2} 
                  placeholder="Nhập địa chỉ..."
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>
          ) : selectedCustomer ? (
            <>
              <div className="flex justify-center mb-6 md:mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-surface-container-high flex items-center justify-center border border-outline-variant/10">
                    <img 
                      src={`https://picsum.photos/seed/${selectedCustomer.id}/200/200`} 
                      alt={selectedCustomer.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-lg shadow-lg">
                    <Edit className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-4 md:gap-y-6">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Mã KH</label>
                  <input className="w-full bg-surface-container-low border-none rounded-lg py-2 px-3 text-xs md:text-sm font-mono text-primary font-bold focus:ring-0" readOnly value={selectedCustomer.id} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Giới tính</label>
                  <select 
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20"
                    value={selectedCustomer.gender}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, gender: e.target.value})}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Họ tên</label>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-2 px-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20" 
                    value={selectedCustomer.name}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, name: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Ngày sinh</label>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20" 
                    type="date" 
                    value={selectedCustomer.birthday}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, birthday: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Điện thoại</label>
                  <div className="flex items-center bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                    <Phone className="text-slate-400 ml-3 w-4 h-4" />
                    <input 
                      className="w-full bg-transparent border-none py-2 px-3 text-sm font-medium focus:ring-0" 
                      value={selectedCustomer.phone}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Email</label>
                  <div className="flex items-center bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                    <Mail className="text-slate-400 ml-3 w-4 h-4" />
                    <input 
                      className="w-full bg-transparent border-none py-2 px-3 text-sm font-medium focus:ring-0" 
                      value={selectedCustomer.email}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-span-2 md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Địa chỉ</label>
                  <textarea 
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 border-none resize-none" 
                    rows={2} 
                    value={selectedCustomer.address}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-6 md:mt-8 p-4 bg-primary rounded-xl flex justify-between items-center text-white">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Tổng tích lũy</p>
                  <p className="text-lg md:text-2xl font-black tracking-tight">{formatCurrency(selectedCustomer.totalSpent)}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-on-surface-variant opacity-50 italic text-sm">
              Chọn khách hàng để xem chi tiết
            </div>
          )}
        </div>
        <div className="p-6 bg-surface-container-low flex justify-between gap-3">
          <button 
            onClick={() => {
              setIsAdding(false);
              if (customers.length > 0) setSelectedCustomer(customers[0]);
            }}
            className="flex-1 py-3 px-4 bg-surface-container-lowest text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Đóng
          </button>
          <div className="flex gap-2 flex-[2]">
            {isAdding ? (
              <button 
                onClick={handleSaveNew}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm rounded-lg shadow-lg transition-all flex items-center justify-center gap-2",
                  isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:brightness-110 active:scale-95"
                )}
              >
                <Plus className={cn("w-4 h-4", isSubmitting && "animate-spin")} /> {isSubmitting ? "Đang lưu..." : "Lưu khách hàng"}
              </button>
            ) : selectedCustomer ? (
              <>
                <button 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="p-3 bg-error-container text-on-error-container rounded-lg hover:opacity-80 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="p-3 bg-secondary-container text-on-secondary-container rounded-lg hover:opacity-80 transition-all disabled:opacity-50"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button 
                  onClick={startAdding}
                  className="flex-1 py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Thêm
                </button>
              </>
            ) : (
              <button 
                onClick={startAdding}
                className="flex-1 py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Thêm mới
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className={cn(
              "fixed bottom-8 left-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-md",
              notification.type === 'success' 
                ? "bg-green-500/90 border-green-400 text-white" 
                : "bg-red-500/90 border-red-400 text-white"
            )}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold tracking-tight">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
