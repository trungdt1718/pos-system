export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  manufacturer?: string;
  origin?: string;
  supplier?: string;
  batch?: string;
  expiry?: string;
  costPrice?: number;
}

export interface Customer {
  id: string;
  name: string;
  gender: string;
  birthday: string;
  phone: string;
  email: string;
  address: string;
  totalSpent: number;
}

export interface Staff {
  id: string;
  name: string;
  gender: string;
  username: string;
  status: string;
  role: string;
  phone: string;
  email: string;
}

export interface Invoice {
  id: string;
  customerName: string;
  products: string;
  time: string;
  total: number;
  status: string;
}
