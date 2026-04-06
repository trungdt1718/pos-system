import axios from "axios";
import { Product, Customer, Staff, Invoice } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

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
