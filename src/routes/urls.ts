import Router from "koa-router";
import { link } from "../controllers";

const UrlRouter = new Router();

// UrlRouter.get("/", link.getUrl);
// UrlRouter.get("/all", link.retrieveAllPages);
UrlRouter.post("/full", link.getFullUrl);
UrlRouter.post("/", link.createShortUrl);
UrlRouter.get("/testEp", link.testEp);
export default UrlRouter;
