import React, { useEffect, useState } from "react";
import { staffService } from "../services/api";
import { Staff } from "../types";
import { cn } from "../lib/utils";
import { Search, Filter, RefreshCcw, Download, UserPlus, Trash2, Edit, Plus, X, User as UserPin } from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: "",
    gender: "Nam",
    username: "",
    status: "Đang làm việc",
    role: "Nhân viên bán hàng",
    email: "",
    phone: ""
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = () => {
    staffService.getAll().then(res => {
      setStaff(res.data);
      if (res.data.length > 0 && !selectedStaff && !isAdding) {
        setSelectedStaff(res.data[0]);
      }
    });
  };

  const handleUpdate = () => {
    if (selectedStaff) {
      staffService.update(selectedStaff.id, selectedStaff).then(() => {
        loadStaff();
        alert("Cập nhật nhân viên thành công!");
      });
    }
  };

  const handleDelete = () => {
    if (selectedStaff && window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${selectedStaff.name}?`)) {
      staffService.delete(selectedStaff.id).then(() => {
        setSelectedStaff(null);
        loadStaff();
      });
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setSelectedStaff(null);
    setFormData({
      name: "",
      gender: "Nam",
      username: "",
      status: "Đang làm việc",
      role: "Nhân viên bán hàng",
      email: "",
      phone: ""
    });
  };

  const handleSaveNew = () => {
    if (!formData.name) return alert("Vui lòng nhập tên nhân viên!");
    staffService.create(formData).then((res) => {
      setIsAdding(false);
      loadStaff();
      setSelectedStaff(res.data);
      alert("Thêm nhân viên mới thành công!");
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 py-6 flex justify-between items-end">
        <div>
          <nav className="flex text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">
            <span>Hệ thống</span>
            <span className="mx-2">/</span>
            <span className="text-primary">Quản lý nhân viên</span>
          </nav>
          <h1 className="text-3xl font-black text-primary-container tracking-tight">Nhân sự</h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-highest text-on-surface flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all active:scale-95">
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
          <button 
            onClick={startAdding}
            className="bg-gradient-to-br from-primary to-primary-container text-white flex items-center gap-2 px-6 py-2 rounded-md font-bold text-sm transition-all active:scale-95 shadow-md"
          >
            <UserPlus className="w-4 h-4" /> Thêm mới
          </button>
        </div>
      </div>

      <div className="flex-1 flex px-8 pb-8 gap-6 overflow-hidden">
        <div className="w-3/5 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-surface flex justify-between items-center border-b border-outline-variant/10">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input 
                className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary/50 focus:ring-0 rounded-lg pl-10 pr-4 py-2 text-sm" 
                placeholder="Tìm theo mã, tên, tài khoản..." 
              />
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors">
                <Filter className="w-5 h-5" />
              </button>
              <button onClick={loadStaff} className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors">
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-low/95 backdrop-blur-md z-10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Mã nhân viên</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Họ tên</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Giới tính</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tài khoản</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tình trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {staff.map((s) => (
                  <tr 
                    key={s.id}
                    onClick={() => {
                      setSelectedStaff(s);
                      setIsAdding(false);
                    }}
                    className={cn(
                      "hover:bg-surface-container-highest/50 cursor-pointer transition-colors group",
                      selectedStaff?.id === s.id && !isAdding && "bg-primary/5 border-l-4 border-primary"
                    )}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-primary">{s.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{s.name}</td>
                    <td className="px-6 py-4 text-sm">{s.gender}</td>
                    <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">{s.username}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-bold uppercase rounded-full",
                        s.status === "Đang làm việc" ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"
                      )}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-2/5 flex flex-col bg-surface-container-lowest rounded-xl shadow-lg border border-primary-container/5 overflow-hidden">
          <div className="bg-primary-container px-6 py-4 flex items-center justify-between">
            <h3 className="text-white font-bold tracking-tight">
              {isAdding ? "Thêm nhân viên mới" : "Thông tin chi tiết"}
            </h3>
            <UserPin className="text-white w-5 h-5" />
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
            {isAdding ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block">Họ tên nhân viên</label>
                    <input 
                      className="w-full bg-surface border border-outline-variant/30 rounded-md px-3 py-2 text-sm font-medium" 
                      placeholder="Nhập họ tên..."
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block">Tài khoản</label>
                    <input 
                      className="w-full bg-surface border border-outline-variant/30 rounded-md px-3 py-2 text-sm font-mono" 
                      placeholder="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block">Mật khẩu</label>
                    <input className="w-full bg-surface border border-outline-variant/30 rounded-md px-3 py-2 text-sm" type="password" placeholder="********" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block">Email công việc</label>
                  <input 
                    className="w-full bg-surface border border-outline-variant/30 rounded-md px-3 py-2 text-sm" 
                    placeholder="email@sumimart.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block">Loại nhân viên</label>
                  <select 
                    className="w-full bg-surface border border-outline-variant/30 rounded-md px-3 py-2 text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
                    <option value="Quản lý kho">Quản lý kho</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block">Giới tính</label>
                  <select 
                    className="w-full bg-surface border border-outline-variant/30 rounded-md px-3 py-2 text-sm"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </>
            ) : selectedStaff ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block">Họ tên nhân viên</label>
                    <input 
                      className="w-full bg-surface border border-outline-variant/30 rounded-md px-3 py-2 text-sm font-medium" 
                      value={selectedStaff.name}
                      onChange={(e) => setSelectedStaff({...selectedStaff, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block">Tài khoản</label>
                    <input 
                      className="w-full bg-surface border border-outline-variant/30 rounded-md px-3 py-2 text-sm font-mono" 
                      value={selectedStaff.username}
                      onChange={(e) => setSelectedStaff({...selectedStaff, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block">Mật khẩu</label>
                    <input className="w-full bg-surface border border-outline-variant/30 rounded-md px-3 py-2 text-sm" type="password" value="********" readOnly />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block">Email công việc</label>
                  <input 
                    className="w-full bg-surface border border-outline-variant/30 rounded-md px-3 py-2 text-sm" 
                    value={selectedStaff.email}
                    onChange={(e) => setSelectedStaff({...selectedStaff, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block">Loại nhân viên</label>
                  <select 
                    className="w-full bg-surface border border-outline-variant/30 rounded-md px-3 py-2 text-sm"
                    value={selectedStaff.role}
                    onChange={(e) => setSelectedStaff({...selectedStaff, role: e.target.value})}
                  >
                    <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
                    <option value="Quản lý kho">Quản lý kho</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-on-surface-variant opacity-50 italic text-sm">
                Chọn nhân viên để xem chi tiết
              </div>
            )}
          </div>
          <div className="p-6 bg-surface-container-low/50 border-t border-outline-variant/10 flex flex-wrap gap-2 justify-end">
            {isAdding ? (
              <>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-5 py-2 rounded-md font-bold text-sm bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95 flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Hủy
                </button>
                <button 
                  onClick={handleSaveNew}
                  className="px-5 py-2 rounded-md font-bold text-sm bg-gradient-to-br from-primary to-primary-container text-white shadow-md hover:brightness-110 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Lưu nhân viên
                </button>
              </>
            ) : selectedStaff ? (
              <>
                <button 
                  onClick={handleDelete}
                  className="px-5 py-2 rounded-md font-bold text-sm bg-surface-container-lowest text-error border border-error/20 hover:bg-error/10 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Xóa
                </button>
                <button 
                  onClick={handleUpdate}
                  className="px-5 py-2 rounded-md font-bold text-sm bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-container-high transition-all active:scale-95 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Chỉnh
                </button>
                <button 
                  onClick={startAdding}
                  className="px-5 py-2 rounded-md font-bold text-sm bg-gradient-to-br from-primary to-primary-container text-white shadow-md hover:brightness-110 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Thêm
                </button>
              </>
            ) : (
              <button 
                onClick={startAdding}
                className="px-5 py-2 rounded-md font-bold text-sm bg-gradient-to-br from-primary to-primary-container text-white shadow-md hover:brightness-110 transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Thêm mới
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
