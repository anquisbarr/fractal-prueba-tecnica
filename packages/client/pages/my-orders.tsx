import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  numberOfProducts: number;
  finalPrice: number;
  status: string;
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api
      .get("/orders")
      .then(response => setOrders(response.data))
      .catch(error => console.error("Error fetching orders:", error));
  }, []);

  const handleDelete = (id: number) => {
    api
      .delete(`/orders/${id}`)
      .then(() => setOrders(orders.filter(order => order.id !== id)))
      .catch(error => console.error("Error deleting order:", error));
  };

  return (
    <div>
      <h1>My Orders</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Order #</TableCell>
            <TableCell>Date</TableCell>
            <TableCell># Products</TableCell>
            <TableCell>Final Price</TableCell>
            <TableCell>Options</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.orderNumber}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.numberOfProducts}</TableCell>
              <TableCell>{order.finalPrice}</TableCell>
              <TableCell>
                <Button component={Link} to={`/add-order/${order.id}`}>
                  Edit
                </Button>
                <Button onClick={() => handleDelete(order.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button component={Link} to="/add-order">
        Add a new order
      </Button>
    </div>
  );
};

export default MyOrders;
