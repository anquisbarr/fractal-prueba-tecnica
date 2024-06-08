import {
  date,
  decimal,
  int,
  mysqlTableCreator,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm/relations";

const mysqlTable = mysqlTableCreator(name => `projects_${name}`);

export const users = mysqlTable("users", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
});

export const orders = mysqlTable("orders", {
  id: int("id").primaryKey().autoincrement(),
  orderNumber: varchar("order_number", { length: 256 }).notNull(),
  date: date("date").notNull().default(new Date()),
  numberOfProducts: int("number_of_products").notNull().default(0),
  finalPrice: decimal("final_price", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.0"),
  status: varchar("status", { length: 50 }).notNull().default("Pending"),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  orderProducts: many(orderProducts),
}));

export const products = mysqlTable("products", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  unitPrice: decimal("unit_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  qty: int("qty").notNull().default(0),
});

export const productsRelations = relations(products, ({ many }) => ({
  orderProducts: many(orderProducts),
}));

export const orderProducts = mysqlTable("order_products", {
  orderId: int("order_id").notNull(),
  productId: int("product_id").notNull(),
  quantity: int("quantity").notNull().default(1),
});

export const orderProductsRelations = relations(orderProducts, ({ one }) => ({
  order: one(orders, {
    fields: [orderProducts.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderProducts.productId],
    references: [products.id],
  }),
}));
