import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const AddEditOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);

  useEffect(() => {
    if (id) {
      api
        .get(`/orders/${id}`)
        .then(response => {
          setOrderNumber(response.data.orderNumber);
          setOrderProducts(
            response.data.productsData.map((product: Product) => ({
              productId: product.id,
              quantity: product.qty,
            })),
          );
        })
        .catch(error => console.error("Error fetching order:", error));
    }
    api
      .get("/products")
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error fetching products:", error));
  }, [id]);

  const handleSave = () => {
    const data = { orderNumber, productsData: orderProducts };
    if (id) {
      api
        .put(`/orders/${id}`, data)
        .then(() => navigate("/my-orders"))
        .catch(error => console.error("Error updating order:", error));
    } else {
      api
        .post("/orders", data)
        .then(() => navigate("/my-orders"))
        .catch(error => console.error("Error creating order:", error));
    }
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    setOrderProducts(prev => {
      const existingProduct = prev.find(op => op.productId === productId);
      if (existingProduct) {
        return prev.map(op =>
          op.productId === productId ? { ...op, quantity } : op,
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <h1>{id ? "Edit Order" : "Add Order"}</h1>
      <TextField
        label="Order Number"
        value={orderNumber}
        onChange={e => setOrderNumber(e.target.value)}
        variant="outlined"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Unit Price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={
                    orderProducts.find(op => op.productId === product.id)
                      ?.quantity || 0
                  }
                  onChange={e => {
                    const quantity = Number.parseInt(e.target.value, 10);
                    handleQuantityChange(product.id, quantity);
                  }}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{product.unitPrice}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={handleSave} variant="contained">
        {id ? "Update Order" : "Create Order"}
      </Button>
    </div>
  );
};

export default AddEditOrder;
