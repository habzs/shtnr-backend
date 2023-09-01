import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateCreatedTimeVisted1693583349615 implements MigrationInterface {
    name = 'AddDateCreatedTimeVisted1693583349615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "link" ADD "times_visited" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "link" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "times_visited"`);
    }

}
