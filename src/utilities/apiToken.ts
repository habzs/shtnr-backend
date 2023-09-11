export function getUserIdFromJwt(ctx: Context) {
  try {
    return ctx.state.meta.userId;
  } catch (err) {
    return null;
  }
}
