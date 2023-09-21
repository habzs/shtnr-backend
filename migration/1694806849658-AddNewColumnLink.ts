import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewColumnLink1694806849658 implements MigrationInterface {
    name = 'AddNewColumnLink1694806849658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "link" ADD "user_id" character varying NOT NULL DEFAULT 'public'`);
        await queryRunner.query(`ALTER TABLE "link" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "user_id"`);
    }

}
