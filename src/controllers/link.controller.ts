// import the types and classes from koa and typeorm libraries
import {
  Context,
  DefaultContext,
  DefaultState,
  ParameterizedContext,
} from "koa";
import { Repository } from "typeorm";
import AppDataSource from "../../config/db_config";
import { Link } from "../entities/links";
import { GetFullRequestDto } from "../requests/get-full-url.request";
import { CreateUrlDto } from "../requests/create-url.request";
import { nanoid } from "nanoid";
import validator from "validator";
import { errors } from "../errors/error_msgs";
import { CreateCustomDTO } from "../requests/create-custom-url.request";
import { getUserIdFromJwt } from "../utilities/apiToken";
import LinkService from "../services/link.service";

// define a default class LinkController that contains static methods for handling requests
class LinkController {
  private linkService = new LinkService();

  // define a static method that takes a context object as a parameter and returns a promise of void
  public async getFullUrl(ctx: Context): Promise<void> {
    // cast the request body to the GetFullRequestDto type and assign it to a variable data
    const data: GetFullRequestDto = <GetFullRequestDto>ctx.request.body;
    const fullUrl = await this.linkService.getFullUrl(data.shtnd_url);

    if (!fullUrl) {
      ctx.status = 400;
      ctx.body = { error: errors.NO_FULL_URL };
    } else {
      ctx.status = 200;
      ctx.body = fullUrl;
    }
  }

  // define a static method that takes a parameterized context object as a parameter and returns a promise of void
  public async redirectUrl(
    ctx: ParameterizedContext<DefaultState, DefaultContext>
  ) {
    // get the repository object for the Link entity from the AppDataSource class
    const urlRepository: Repository<Link> = AppDataSource.getRepository(Link);
    // get the short url from the params object of the context and assign it to a variable shtnd_url
    const shtnd_url = ctx.params.shtnd_url;

    // get the original url from the database by using the findOne method of the repository object with a where clause
    const url = await urlRepository.findOne({ where: { shtnd_url } });

    // if the url is not found, set the status code to 404 and send back an error message as the response body
    if (!url) {
      ctx.status = 404;
      ctx.body = "Url not found";
      // otherwise, set the status code to 200 and send back the url object as the response body
    } else {
      ctx.status = 200;
      ctx.body = url;
    }
  }

  // define a static method that takes a context object as a parameter and returns a promise of void
  public async testEp(ctx: Context): Promise<void> {
    // log a message to the console for debugging purposes
    console.log("Wake up!");
    // set the response body to an object with status and data properties
    ctx.body = { status: "success", data: "pong" };
  }

  // define a static method that takes a context object as a parameter and returns a promise of void
  public async createShortUrl(ctx: Context): Promise<void> {
    const data = <CreateUrlDto>ctx.request.body;
    const userId = await getUserIdFromJwt(ctx);
    // if data.url is empty
    if (!data.url) {
      // set the status code to 400 and send back an error message as the response body
      ctx.status = 400;
      ctx.body = { error: "Url is required" };
      return;
    }

    if (!validator.isURL(data.url)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid url", err_code: "E1002" };
      return;
    }

    try {
      const shtnd_url = await this.linkService.createShortUrl(
        data.url,
        userId,
        data.customUrl
      );
      ctx.body = shtnd_url;
    } catch (err) {
      if (err.message === errors.SHORTED_URL_ALREADY_EXISTS) {
        ctx.status = 400;
        ctx.body = { err_code: errors.SHORTED_URL_ALREADY_EXISTS };
      }
    }

    return;
  }

  public async createCustomUrl(ctx: Context): Promise<void> {
    // get the repository object for the Link entity from the AppDataSource class
    const urlRepository: Repository<Link> = AppDataSource.getRepository(Link);
    // cast the request body to the CreateUrlDto type and assign it to a variable data
    const data = <CreateCustomDTO>ctx.request.body;
    const userId = await getUserIdFromJwt(ctx);

    // if data.url is empty
    if (!data.url) {
      // set the status code to 400 and send back an error message as the response body
      ctx.status = 400;
      ctx.body = { error: "Url is required", err_code: "E1000" };
      return;
    }

    if (!data.customUrl) {
      ctx.status = 400;
      ctx.body = { error: "Custom url is required", err_code: "E1001" };
      return;
    }

    // url validator
    if (!validator.isURL(data.url)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid url", err_code: "E1002" };
      return;
    }

    // converts http:// to https://
    if (!data.url.startsWith("http://") && !data.url.startsWith("https://")) {
      data.url = "https://" + data.url;
    }

    if (data.url.startsWith("http://")) {
      data.url = "https://" + data.url.slice(7);
    }

    const customUrlUsed = await urlRepository.findOne({
      where: { shtnd_url: data.customUrl },
    });

    if (customUrlUsed) {
      ctx.status = 400;
      ctx.body = { error: "Custom url already exists", err_code: "E1003" };
      return;
    }

    const urlExistsInDb = await urlRepository.findOne({
      where: { shtnd_url: data.customUrl, user_id: userId },
    });

    if (urlExistsInDb) {
      ctx.status = 200;
      ctx.body = {
        url: urlExistsInDb.url,
        shtnd_url: urlExistsInDb.shtnd_url,
        times_visited: urlExistsInDb.times_visited,
        created_at: urlExistsInDb.created_at,
      };
      return;
    }

    const newUrl = new Link();
    newUrl.url = data.url;
    newUrl.shtnd_url = data.customUrl;
    newUrl.times_visited = 0;
    newUrl.user_id = userId;

    await urlRepository.save(newUrl);

    ctx.status = 200;
    ctx.body = {
      url: newUrl.url,
      shtnd_url: newUrl.shtnd_url,
      times_visited: newUrl.times_visited,
      created_at: newUrl.created_at,
      user_id: userId,
    };
  }
}
export default new LinkController();
