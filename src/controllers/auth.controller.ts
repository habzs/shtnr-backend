import { Context } from "koa";
import AppDataSource from "../../config/db_config";
import { User } from "../entities/users";
import { ValidationError, validate } from "class-validator";
import { CreateUserRequestDTO } from "../requests/create-user.request";
import { Repository } from "typeorm";
import { LoginUserRequestDTO } from "../requests/login-user.request";
import { getUserIdFromJwt } from "../utilities/apiToken";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const handleErrors = (errors: ValidationError[]) => {
  let errorMessages = {};
  errors.forEach((error) => {
    const { property, constraints } = error;
    errorMessages[property] = Object.values(constraints)[0];
  });
  return errorMessages;
};

const createToken = (id: User["id"]) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge, // 3 days
  });
};

const maxAge = 3 * 24 * 60 * 60;

class AuthController {
  //
  public async signup(ctx: Context): Promise<void> {
    await AppDataSource.manager.transaction(
      async (transactionEntityManager) => {
        const userTx = new User();

        const data: CreateUserRequestDTO = <CreateUserRequestDTO>(
          ctx.request.body
        );

        const salt = await bcrypt.genSalt();

        userTx.email = data.email;
        userTx.username = data.username;
        userTx.password = data.password;
        console.log(userTx.password);

        const errors: ValidationError[] = await validate(userTx);

        if (errors.length > 0) {
          const errorsMsg = handleErrors(errors);
          ctx.status = 400;
          ctx.body = { errorsMsg };
        } else {
          userTx.password = await bcrypt.hash(data.password, salt);
          try {
            await transactionEntityManager.save(userTx);
            const token = createToken(userTx.id);
            ctx.cookies.set("auth", token, {
              httpOnly: true,
              maxAge: maxAge * 1000,
            });

            ctx.body = {
              status: "account created",
              username: userTx.username,
              email: userTx.email,
            };
          } catch (error) {
            // TODO: abstract into it's own function

            console.log("error returned", error);
            if (error.code === "23505") {
              ctx.status = 400;
              if (error.detail.includes("username")) {
                ctx.body = {
                  errorsMsg: { username: "Username already exists" },
                };
              } else if (error.detail.includes("email")) {
                ctx.body = { errorsMsg: { email: "Email already exists" } };
              } else {
                ctx.body = { errorsMsg: "Unknown error" };
              }
            }
          }
        }
      }
    );

    return;
  }

  public async login(ctx: Context): Promise<void> {
    const userRepo: Repository<User> = AppDataSource.getRepository(User);

    const data: LoginUserRequestDTO = <LoginUserRequestDTO>ctx.request.body;

    const user = await userRepo.findOne({ where: { email: data.email } });

    if (user) {
      const auth = await bcrypt.compare(data.password, user.password);

      if (auth) {
        const token = createToken(user.id);
        ctx.cookies.set("auth", token, {
          httpOnly: true,
          maxAge: maxAge * 1000,
          sameSite: "lax",
          secure: true,
        });
        ctx.status = 200;
        ctx.body = { msg: "logged in", user: user };
        return;
      }
    }
    ctx.status = 400;
    ctx.body = { errorsMsg: "Invalid email or password" };
  }

  public async logout(ctx: Context): Promise<void> {
    ctx.cookies.set("auth", "", {
      maxAge: 1,
      httpOnly: false,
      overwrite: true,
    });
    ctx.body = { msg: "logged out" };
  }
}

export default new AuthController();
