export interface ProductData {
  productId: number;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  unitPrice: string;
  qty: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  date: Date;
  numberOfProducts: number;
  finalPrice: string;
  status: string;
}

export interface OrderProduct {
  orderId: number;
  productId: number;
  quantity: number;
}
