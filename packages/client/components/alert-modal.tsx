import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import type { FC } from "react";

interface AlertModalProps {
  open: boolean;
  handleClose: () => void;
  handleDelete: (id: number) => void;
  toBeDeleted: number | null;
}

const AlertModal: FC<AlertModalProps> = ({
  open,
  handleClose,
  handleDelete,
  toBeDeleted,
}: AlertModalProps) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={() => toBeDeleted && handleDelete(toBeDeleted)}>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AlertModal;
