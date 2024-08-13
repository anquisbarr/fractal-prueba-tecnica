import { useEffect, useState } from "react";
import api from "../config/api";

interface Product {
  id: number;
  name: string;
  unitPrice: number;
  qty: number;
}

interface OrderProduct {
  productId: number;
  quantity: number;
}

export const useProductsOrder = (orderNumber: string | undefined) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderNumberState, setOrderNumber] = useState(orderNumber || "");
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);

  useEffect(() => {
    if (orderNumber) {
      api
        .get(`/orders/${orderNumber}`)
        .then(response => {
          setOrderNumber(response.data.orderNumber);
          setOrderProducts(
            response.data.productsData.map((product: OrderProduct) => ({
              productId: product.productId,
              quantity: product.quantity,
            })),
          );
        })
        .catch(error => console.error("Error fetching order:", error));
    }
    api
      .get("/products")
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error fetching products:", error));
  }, [orderNumber]);

  return {
    orderNumber,
    orderNumberState,
    products,
    orderProducts,
    setOrderProducts,
    setOrderNumber,
  };
};
