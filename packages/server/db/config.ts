import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2';
import { env } from "../../../config/env";

const client = mysql.createConnection({
    host: env.DATABASE_HOST,
    user: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    port: parseInt(env.DATABASE_PORT, 10)
});

export const db = drizzle(client);