import { DeleteResult, EntityManager } from "typeorm";
import AppDataSource from "../../../config/db_config";
import { Link } from "../../entities/links";

export interface ILinkDb {
  saveExistingLinkEntry: (
    tx: Link,
    entityManager?: EntityManager
  ) => Promise<void>;
  getFullUrl: (
    shtnr_url: string,
    entityManager?: EntityManager
  ) => Promise<Link>;
  isUrlIn: (
    fullUrl: string,
    entityManager: EntityManager,
    user_id?: string
  ) => Promise<Link>;
  createShortUrl: (
    userId: string,
    fullUrl: string,
    shtnd_url: string,
    entityManager?: EntityManager
  ) => Promise<Link>;
  getFullUrlWithUser: (
    shtnd_url: string,
    user_id: string,
    entityManager?: EntityManager
  ) => Promise<Link>;
  getCustomUrls: (
    userId: string,
    entityManager?: EntityManager
  ) => Promise<Link[]>;
  removeUrl: (
    userId: string,
    shtnd_url: string,
    entityManager?: EntityManager
  ) => Promise<DeleteResult>;
}

export class LinkDb implements ILinkDb {
  public async saveExistingLinkEntry(
    tx: Link,
    entityManager: EntityManager = AppDataSource.manager
  ): Promise<void> {
    await entityManager.getRepository(Link).save(tx);
  }

  public async getFullUrl(
    shtnd_url: string,
    entityManager: EntityManager = AppDataSource.manager
  ): Promise<Link> {
    const url = await entityManager.getRepository(Link).findOne({
      where: { shtnd_url: shtnd_url },
    });

    return url;
  }

  public async getFullUrlWithUser(
    shtnd_url: string,
    user_id: string,
    entityManager: EntityManager = AppDataSource.manager
  ): Promise<Link> {
    const url = await entityManager.getRepository(Link).findOne({
      where: { shtnd_url: shtnd_url, user_id: user_id },
    });

    return url;
  }

  public async isUrlIn(
    fullUrl: string,
    entityManager: EntityManager = AppDataSource.manager,
    user_id?: string
  ) {
    // If user_id is provided, use it in the where clause, otherwise omit it
    const whereClause = user_id
      ? { url: fullUrl, user_id: user_id }
      : { url: fullUrl };

    const url = await entityManager.getRepository(Link).findOne({
      where: whereClause,
    });

    return url;
  }

  public async createShortUrl(
    userId: string,
    fullUrl: string,
    shtnd_url: string,
    entityManager: EntityManager = AppDataSource.manager
  ) {
    const newUrl = new Link();
    newUrl.url = fullUrl;
    newUrl.shtnd_url = shtnd_url;
    newUrl.user_id = userId;

    await entityManager.getRepository(Link).save(newUrl);

    return newUrl;
  }

  public async getCustomUrls(
    userId: string,
    entityManager: EntityManager = AppDataSource.manager
  ) {
    const url = await entityManager.getRepository(Link).find({
      where: { user_id: userId },
    });

    return url;
  }

  public async removeUrl(
    userId: string,
    shtnd_url: string,
    entityManager: EntityManager = AppDataSource.manager
  ) {
    const res = await entityManager.getRepository(Link).delete({
      user_id: userId,
      shtnd_url: shtnd_url,
    });

    return res;
  }
}
