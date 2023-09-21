import { EntityManager } from "typeorm";
import { Link } from "../entities/links";
import { ILinkDb, LinkDb } from "../db/links/link.db";
import AppDataSource from "../../config/db_config";
import {
  CustomLinkResponse,
  FullLinkResponse,
  ShtndLinkResponse,
} from "../interfaces/link.interface";
import { nanoid } from "nanoid";
import { errors } from "../errors/error_msgs";

export default class LinkService {
  private linkDb: ILinkDb = new LinkDb();

  // helper functions
  public async saveExistingLinkEntry(
    tx: Link,
    entityManager?: EntityManager
  ): Promise<void> {
    await this.linkDb.saveExistingLinkEntry(tx, entityManager);
  }

  public async isUrlIn(
    fullUrl: string,
    entityManager?: EntityManager,
    user_id?: string
  ) {
    return await this.linkDb.isUrlIn(fullUrl, entityManager, user_id);
  }

  public async getFullUrl(
    shtnd_url: string,
    entityManager?: EntityManager
  ): Promise<FullLinkResponse> {
    const url = await this.linkDb.getFullUrl(shtnd_url, entityManager);

    if (url) {
      // // increment the times_visited property of the url object by 1
      // url.times_visited += 1;
      // // save the updated url object to the database by using the save method of the repository object
      // await urlRepository.save(url);

      url.times_visited += 1;

      // another method using transaction managers
      await AppDataSource.manager.transaction(
        async (transactionEntityManager) => {
          await this.saveExistingLinkEntry(url, transactionEntityManager);
        }
      );

      return { url: url.url };
    }

    return;
  }

  public async createShortUrl(
    fullUrl: string,
    userId: string,
    customUrl: string,
    entityManager?: EntityManager
  ): Promise<ShtndLinkResponse> {
    // userId = "bc4f0b0f-9331-4ebc-a049-a100879fb080";
    // userId = "4a71c421-40d2-4ebf-885f-901ed5234b56";
    // clean up url
    // check if the url starts with http or https
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      // if not, add https:// to the beginning of the url
      fullUrl = "https://" + fullUrl;
    }
    // if url starts with http://, remove the http:// part and add https:// to the beginning of the url
    if (fullUrl.startsWith("http://")) {
      fullUrl = "https://" + fullUrl.slice(7);
    }

    // IF there isnt a user id attached (public link), check if the original url is already in the db and return that
    if (!userId) {
      const urlExistsInDb = await this.isUrlIn(
        fullUrl,
        entityManager,
        "public"
      );
      if (urlExistsInDb) {
        return { shtnd_url: urlExistsInDb.shtnd_url };
      } else {
        while (true) {
          const shtnd_url = nanoid(4);
          const url = await this.linkDb.getFullUrl(shtnd_url, entityManager);
          if (!url) {
            const newUrl = this.linkDb.createShortUrl(
              userId,
              fullUrl,
              shtnd_url,
              entityManager
            );
            return newUrl;
          }
        }
      }
    } else {
      if (customUrl) {
        const urlExistsInDb = await this.linkDb.getFullUrl(
          customUrl,
          entityManager
        );
        if (urlExistsInDb) {
          throw new Error(errors.SHORTED_URL_ALREADY_EXISTS);
          //   return {
          //     error: "Custom url already exists",
          //     err_code: "E1003",
          //   };
        } else {
          const url = await this.linkDb.getFullUrl(customUrl, entityManager);
          if (!url) {
            const newUrl = this.linkDb.createShortUrl(
              userId,
              fullUrl,
              customUrl,
              entityManager
            );
            return newUrl;
          }
        }
      } else {
        // generate random shtnd_url that is unique to the USER_id
        const urlExistsInDb = await this.isUrlIn(
          fullUrl,
          entityManager,
          userId
        );
        if (urlExistsInDb) {
          return { shtnd_url: urlExistsInDb.shtnd_url };
        }

        while (true) {
          const shtnd_url = nanoid(4);
          const url = await this.linkDb.getFullUrlWithUser(
            shtnd_url,
            userId,
            entityManager
          );
          if (!url) {
            const newUrl = this.linkDb.createShortUrl(
              userId,
              fullUrl,
              shtnd_url,
              entityManager
            );
            return newUrl;
          }
        }
      }
    }
  }

  public async getCustomUrls(
    user_id: string,
    entityManager?: EntityManager
  ): Promise<CustomLinkResponse[]> {
    const urls = await this.linkDb.getCustomUrls(user_id, entityManager);

    const urlTx = urls.map((tx) => {
      return {
        url: tx.url,
        shtnd_url: tx.shtnd_url,
        times_visited: tx.times_visited,
        created_at: tx.created_at,
        user_id: tx.user_id,
      };
    });

    return urlTx;
  }

  public async removeUrl(
    user_id: string,
    shtnd_url: string,
    entityManager?: EntityManager
  ): Promise<any> {
    const result = await this.linkDb.removeUrl(
      user_id,
      shtnd_url,
      entityManager
    );
    console.log(result);
    if (result.affected === 0) {
      throw new Error(errors.NO_SHORTED_URL_FOUND);
    }

    return { message: "Successfully deleted" };
  }
}
