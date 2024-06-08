import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DeleteAlertModal from "../components/delete-alert-modal";
import EditProductModal from "../components/edit-product-modal";
import NewProductModal from "../components/new-product-modal";
import api from "../config/api";
import type { Product } from "../types/product";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState<number | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Product>({
    id: 0,
    name: "",
    unitPrice: 0,
    qty: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    api
      .get("/products")
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error fetching products:", error));
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpenEditModal = (product: Product) => {
    setCurrentProduct(product);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleClickOpenDeleteModal = (id: number) => {
    setToBeDeleted(id);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };

  const handleDelete = (id: number) => {
    if (toBeDeleted === null) {
      handleCloseDeleteModal();
      toast.error("No product selected");
      return;
    }
    api
      .delete(`/products/${id}`)
      .then(() => {
        setProducts(products.filter(product => product.id !== id));
        toast.success("Product deleted");
      })
      .catch(error => {
        toast.error("Error deleting product");
        console.error("Error deleting product:", error);
      });
    handleCloseDeleteModal();
  };

  const handleSave = () => {
    const { name, unitPrice, qty } = newProduct;
    if (!name || !unitPrice || !qty) {
      toast.error("All fields are required");
      return;
    }
    api
      .post("/products", {
        name,
        unitPrice: unitPrice,
        qty: qty,
      })
      .then(() => {
        fetchProducts();
        toast.success("Product created");
      })
      .catch(error => {
        toast.error("Error creating product");
        console.error("Error creating product:", error);
      });
    handleClose();
  };

  const handleUpdate = (updatedProduct: Product) => {
    api
      .put(`/products/${updatedProduct.id}`, updatedProduct)
      .then(() => {
        fetchProducts();
        toast.success("Product updated");
      })
      .catch(error => {
        toast.error("Error updating product");
        console.error("Error updating product:", error);
      });
    handleCloseEditModal();
  };

  return (
    <div>
      <h1>Products</h1>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Add Product
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Unit Price</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell>{product.id}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.unitPrice}</TableCell>
              <TableCell>{product.qty}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleClickOpenEditModal(product)}
                  color="primary"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleClickOpenDeleteModal(product.id)}
                  style={{ color: "#f44336" }}
                >
                  Delete
                </Button>
                <DeleteAlertModal
                  open={openDeleteModal}
                  handleClose={handleCloseDeleteModal}
                  handleDelete={handleDelete}
                  toBeDeleted={toBeDeleted}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <NewProductModal
        open={open}
        handleClose={handleClose}
        handleSave={handleSave}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
      />
      {currentProduct && (
        <EditProductModal
          open={openEditModal}
          handleClose={handleCloseEditModal}
          handleUpdate={handleUpdate}
          product={currentProduct}
        />
      )}
    </div>
  );
};

export default Products;
