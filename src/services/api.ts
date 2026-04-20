import axios from "axios";
import { Product, Customer, Staff, Invoice } from "../types";

const getBaseURL = () => {
  let url = localStorage.getItem("sumi_mart_api_url") || import.meta.env.VITE_API_URL || "/api";
  
  // Tự động sửa lỗi Mixed Content: Nếu trang web là HTTPS mà API là HTTP
  if (window.location.protocol === "https:" && url.startsWith("http://")) {
    console.warn("Tự động chuyển đổi API từ HTTP sang HTTPS để tránh lỗi Mixed Content.");
    url = url.replace("http://", "https://");
  }
  
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Update baseURL if changed manually (optional, but good for consistency)
export const updateApiBaseURL = (newUrl: string) => {
  api.defaults.baseURL = newUrl;
};

export const productService = {
  getAll: () => api.get<Product[]>("/products"),
  create: (data: Partial<Product>) => api.post<Product>("/products", data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const customerService = {
  getAll: () => api.get<Customer[]>("/customers"),
  create: (data: Partial<Customer>) => api.post<Customer>("/customers", data),
  update: (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

export const staffService = {
  getAll: () => api.get<Staff[]>("/staff"),
  create: (data: Partial<Staff>) => api.post<Staff>("/staff", data),
  update: (id: string, data: Partial<Staff>) => api.put<Staff>(`/staff/${id}`, data),
  delete: (id: string) => api.delete(`/staff/${id}`),
};

export const invoiceService = {
  getAll: () => api.get<Invoice[]>("/invoices"),
  create: (data: Partial<Invoice>) => api.post<Invoice>("/invoices", data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
};

export const systemService = {
  getSettings: () => api.get<any>("/system/settings"),
};
