import express from "express";
import ordersRoutes from "./routes/orders";
import productsRoutes from "./routes/products";

const app = express();

app.use(express.json());
app.use("/api", ordersRoutes);
app.use("/api", productsRoutes);

export default app;
