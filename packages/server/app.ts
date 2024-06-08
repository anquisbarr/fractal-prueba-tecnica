import cors from "cors";
import express from "express";
import morgan from "morgan";
import ordersRoutes from "./routes/orders";
import productsRoutes from "./routes/products";

const app = express();
const corsOptions = {
  origin: "http://localhost:5173",
};

app.use(morgan("combined"));
app.use(express.json());
app.use(cors(corsOptions));

app.use("/api", ordersRoutes);
app.use("/api", productsRoutes);

export default app;
