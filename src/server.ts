import { DefaultContext, DefaultState, ParameterizedContext } from "koa";
import AppDataSource from "../config/db_config";
import HealthcheckRoute from "./routes/healthcheck";
import UrlRouter from "./routes/urls";
import cors from "koa2-cors";

require("dotenv").config();

const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");

const app = new Koa();
const router = new Router();

// router.get(
//   "/",
//   async (ctx: ParameterizedContext<DefaultState, DefaultContext>) => {
//     ctx.body = { msg: "Hello World!" };
//   }
// );

app.use(bodyParser());
// app.use(cors());
app.use(
  cors({
    origin: "https://shtnr.owenlee.net",
    // origin: "http://localhost:3000",
    credentials: true,
  })
);

// mock database
// let users = [
//   {
//     name: "John",
//     age: 20,
//     email: "test@asd.com",
//   },
//   {
//     name: "Bob",
//     age: 22,
//     email: "tsss@asd.com",
//   },
//   {
//     name: "Alice",
//     age: 10,
//     email: "dggg@asd.com",
//   },
// ];

// post requests
// router.post(
//   "/user/:id",
//   async (ctx: {
//     request: any;
//     body: { name: string; age: number; email: string };
//     params: { id: number };
//   }) => {
//     ctx.body = Object.assign(users[ctx.params.id], ctx.request.body);
//   }
// );

// app.use(router.routes()).use(router.allowedMethods());
// app.use(HealthcheckRoute.routes()).use(HealthcheckRoute.allowedMethods());
app.use(UrlRouter.routes()).use(UrlRouter.allowedMethods());

AppDataSource.initialize()
  .then(() => {
    console.log("Initialized");
    app.listen(4000).on("listening", () => {
      console.log(`Listening on port 4000...`);
    });
  })
  .catch((err) => {
    console.log("Caught error");
    console.log(err);
  });
