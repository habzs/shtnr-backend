import Router from "koa-router";
import { link, auth } from "../controllers";
import LinkController from "../controllers/link.controller";
import AuthController from "../controllers/auth.controller";
import { verifyTokenMiddleware } from "../utilities/apiToken";

const UrlRouter = new Router();

UrlRouter.post("/full", async (ctx) => await LinkController.getFullUrl(ctx));
UrlRouter.post("/", async (ctx) => await LinkController.createShortUrl(ctx));
UrlRouter.post(
  "/custom",
  async (ctx) => await LinkController.createCustomUrl(ctx)
);

// router.get("routeName", "middleware", "controller");
UrlRouter.post("/auth/signup", async (ctx) => await AuthController.signup(ctx));
UrlRouter.post("/auth/login", async (ctx) => await AuthController.login(ctx));
UrlRouter.post("/auth/logout", async (ctx) => await AuthController.logout(ctx));

UrlRouter.post("/auth/verify-token", verifyTokenMiddleware);

UrlRouter.get("/testEp", link.testEp);
export default UrlRouter;
