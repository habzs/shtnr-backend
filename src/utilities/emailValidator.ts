import validator from "validator";

export default class Utils {
  public static emailValidator(email: string): boolean {
    if (typeof email !== "string") return false;

    if (!validator.isEmail(email)) return false;
    return true;
  }
}
