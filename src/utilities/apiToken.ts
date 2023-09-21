import { Context } from "koa";
const jwt = require("jsonwebtoken");

async function verifyToken(authToken) {
  try {
    const decoded = await jwt.verify(authToken, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error("Invalid token");
  }
}

export async function getUserIdFromJwt(ctx: Context) {
  const authToken = ctx.cookies.get("auth");
  try {
    if (!authToken) throw new Error("No token");

    const decoded = await verifyToken(authToken);
    return decoded.id;
  } catch (err) {
    return;
  }
}

export const verifyTokenMiddleware = async (ctx: Context, next: () => void) => {
  const authToken = ctx.cookies.get("auth");
  try {
    if (!authToken) throw new Error("No token");

    const decoded = await verifyToken(authToken);

    ctx.body = { id: decoded.id };
  } catch (err) {
    ctx.body = {
      msg: "invalid token",
    };
  }

  await next();
};
