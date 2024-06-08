import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React from "react";
import type { Product } from "../types/product";

interface EditProductModalProps {
  open: boolean;
  handleClose: () => void;
  handleUpdate: (product: Product) => void;
  product: Product;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  open,
  handleClose,
  handleUpdate,
  product,
}) => {
  const [updatedProduct, setUpdatedProduct] = React.useState<Product>(product);

  React.useEffect(() => {
    setUpdatedProduct(product);
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUpdatedProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    handleUpdate(updatedProduct);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          name="name"
          fullWidth
          value={updatedProduct.name}
          onChange={handleChange}
          disabled
        />
        <TextField
          margin="dense"
          label="Unit Price"
          name="unitPrice"
          type="number"
          fullWidth
          value={updatedProduct.unitPrice}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Quantity"
          name="qty"
          type="number"
          fullWidth
          value={updatedProduct.qty}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductModal;
