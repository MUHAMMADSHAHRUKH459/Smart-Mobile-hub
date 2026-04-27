export interface Product {
  id: string;
  name: string;
  modelName: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockAlert: number;
  imei1?: string;
  imei2?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  modelName: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockAlert: number;
  imei1?: string;
  imei2?: string;
}