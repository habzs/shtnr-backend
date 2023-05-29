import { DataSource } from "typeorm";
import { Link } from "./entities/links";
require("dotenv").config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "password",
  database: "shtnr",
  entities: [Link],
  synchronize: true,
  logging: false,
});

export default AppDataSource;
