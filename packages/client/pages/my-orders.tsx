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
import { toast } from "sonner";
import AlertModal from "../components/alert-modal";
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
  const [open, setOpen] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState<number | null>(null);

  useEffect(() => {
    api
      .get("/orders")
      .then(response => setOrders(response.data))
      .catch(error => console.error("Error fetching orders:", error));
  }, []);

  const handleClickOpen = (id: number) => {
    setToBeDeleted(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    if (toBeDeleted === null) {
      handleClose();
      toast.error("No order selected");
      return;
    }
    api
      .delete(`/orders/${id}`)
      .then(() => {
        setOrders(orders.filter(order => order.id !== id));
        toast.success("Order deleted");
      })
      .catch(error => console.error("Error deleting order:", error));
    handleClose();
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
              <TableCell>
                {new Date(order.date).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  minute: "2-digit",
                  hour: "2-digit",
                })}
              </TableCell>
              <TableCell>{order.numberOfProducts}</TableCell>
              <TableCell>{order.finalPrice}</TableCell>
              <TableCell>
                <Button component={Link} to={`/add-order/${order.orderNumber}`}>
                  Edit
                </Button>
                <Button onClick={() => handleClickOpen(order.id)}>
                  Delete
                </Button>
                <AlertModal
                  open={open}
                  handleClose={handleClose}
                  handleDelete={handleDelete}
                  toBeDeleted={toBeDeleted}
                />
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
