import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLinkTables1693580426110 implements MigrationInterface {
    name = 'AddLinkTables1693580426110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "link" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "shtnd_url" character varying NOT NULL, CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "link"`);
    }

}
