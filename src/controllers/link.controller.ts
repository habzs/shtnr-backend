// import the types and classes from koa and typeorm libraries
import {
  Context,
  DefaultContext,
  DefaultState,
  ParameterizedContext,
} from "koa";
import { Repository } from "typeorm";
// import the custom class AppDataSource that handles the database connection
import AppDataSource from "../db_config";
// import the Link entity that represents a table in the database
import { Link } from "../entities/links";
// import the GetFullRequestDto class that defines the shape of the request body for getting the full url
import { GetFullRequestDto } from "../requests/get-full-url.request";
// import the CreateUrlDto class that defines the shape of the request body for creating a short url
import { CreateUrlDto } from "../requests/create-url.request";
// import the nanoid function that generates random strings
import { nanoid } from "nanoid";

// define a default class LinkController that contains static methods for handling requests
export default class LinkController {
  // define a static method that takes a context object as a parameter and returns a promise of void
  public static async getFullUrl(ctx: Context): Promise<void> {
    // get the repository object for the Link entity from the AppDataSource class
    const urlRepository: Repository<Link> = AppDataSource.getRepository(Link);
    // cast the request body to the GetFullRequestDto type and assign it to a variable data
    const data: GetFullRequestDto = <GetFullRequestDto>ctx.request.body;

    // check if the short url is already in the database by using the findOne method of the repository object with a where clause
    const url = await urlRepository.findOne({
      where: { shtnd_url: data.shtnd_url },
    });

    // log some messages to the console for debugging purposes
    console.log("Request receivedd");
    console.log(data);
    console.log("url", url);
    // if the url is found, set the status code to 200 and send back the url object as the response body
    if (url) {
      ctx.status = 200;
      ctx.body = url;
      // otherwise, set the status code to 400 and send back an error message as the response body
    } else {
      ctx.status = 400;
      ctx.body = { error: "Url not found" };
    }
  }

  // define a static method that takes a parameterized context object as a parameter and returns a promise of void
  public static async redirectUrl(
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
  public static async testEp(ctx: Context): Promise<void> {
    // log a message to the console for debugging purposes
    console.log("oops");
    // set the response body to an object with status and data properties
    ctx.body = { status: "success", data: "pong" };
  }

  // define a static method that takes a context object as a parameter and returns a promise of void
  public static async createShortUrl(ctx: Context): Promise<void> {
    // get the repository object for the Link entity from the AppDataSource class
    const urlRepository: Repository<Link> = AppDataSource.getRepository(Link);
    // cast the request body to the CreateUrlDto type and assign it to a variable data
    const data = <CreateUrlDto>ctx.request.body;

    // if data.url is empty
    if (!data.url) {
      // set the status code to 400 and send back an error message as the response body
      ctx.status = 400;
      ctx.body = { error: "Url is required" };
      return;
    }

    // clean up url
    // check if the url starts with http or https
    if (!data.url.startsWith("http://") && !data.url.startsWith("https://")) {
      // if not, add https:// to the beginning of the url
      data.url = "https://" + data.url;
    }

    // if url starts with http://, remove the http:// part and add https:// to the beginning of the url
    if (data.url.startsWith("http://")) {
      data.url = "https://" + data.url.slice(7);
    }

    // check if the original url is already in the database by using the findOne method of the repository object with a where clause
    const urlExistsInDb = await urlRepository.findOne({
      where: { url: data.url }, // no error here
    });

    // if the url is found, set the status code to 200 and send back the url object as the response body and return from this function
    if (urlExistsInDb) {
      ctx.status = 200;
      ctx.body = urlExistsInDb;
      return;
    }

    // use a while loop to generate and check for unique short urls until one is found
    while (true) {
      // generate a random string of length 4 using nanoid function and assign it to a variable shtnd_url
      const shtnd_url = nanoid(4);
      // check if there is already an existing url with this short url in database by using findOne method of repository object with where clause
      const url = await urlRepository.findOne({ where: { shtnd_url } });
      // if no such url is found, create a new Link object and assign its properties with data.url and shtnd_url
      if (!url) {
        const newUrl = new Link();
        newUrl.url = data.url;
        newUrl.shtnd_url = shtnd_url;
        // save this new Link object to database by using save method of repository object
        await urlRepository.save(newUrl);
        // set status code to 200 and send back newUrl object as response body and return from this function
        ctx.status = 200;
        ctx.body = newUrl;
        return;
      }
    }
  }
}
