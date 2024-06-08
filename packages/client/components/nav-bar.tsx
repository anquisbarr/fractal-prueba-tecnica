import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { FC } from "react";
import { Link } from "react-router-dom";

const Navbar: FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          style={{ flexGrow: 1 }}
          component={Link}
          to={"/my-orders"}
        >
          Orders App
        </Typography>
        <Button color="inherit" component={Link} to="/my-orders">
          My Orders
        </Button>
        <Button color="inherit" component={Link} to="/add-order">
          Add/Edit Order
        </Button>
        <Button color="inherit" component={Link} to="/products">
          Products
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
