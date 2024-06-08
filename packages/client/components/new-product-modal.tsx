import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import type React from "react";
import type { Product } from "../types/product";

interface NewProductModalProps {
  open: boolean;
  handleClose: () => void;
  handleSave: () => void;
  newProduct: Product;
  setNewProduct: React.Dispatch<React.SetStateAction<Product>>;
}

const NewProductModal = ({
  open,
  handleClose,
  handleSave,
  newProduct,
  setNewProduct,
}: NewProductModalProps) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add a new product</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          value={newProduct.name}
          onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Unit Price"
          type="number"
          fullWidth
          value={newProduct.unitPrice}
          onChange={e =>
            setNewProduct({ ...newProduct, unitPrice: Number(e.target.value) })
          }
        />
        <TextField
          margin="dense"
          label="Quantity"
          type="number"
          fullWidth
          value={newProduct.qty}
          onChange={e =>
            setNewProduct({ ...newProduct, qty: Number(e.target.value) })
          }
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

export default NewProductModal;
