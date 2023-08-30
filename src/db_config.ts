import { DataSource } from "typeorm";
import { Link } from "./entities/links";
require("dotenv").config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Link],
  synchronize: true,
  logging: true,
  ssl: true,
  // url: process.env.DATABASE_URL,

  // type: "postgres",
  // host: "localhost",
  // port: 5435,
  // username: "postgres",
  // password: "password",
  // database: "shtnr",
  // entities: [Link],
  // synchronize: true,
  // logging: true,
});

export default AppDataSource;
