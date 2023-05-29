import Router from "koa-router";
const HealthcheckRoute = new Router();

HealthcheckRoute.post("/ping", async (ctx) => {
  //   ctx.body = "Hello World";
  ctx.body = { status: "success", data: "pong" };
  console.log("checked health");
});

export default HealthcheckRoute;
