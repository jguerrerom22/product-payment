import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDeliveryStatusEnum1770397243427 implements MigrationInterface {
    name = 'UpdateDeliveryStatusEnum1770397243427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery" DROP CONSTRAINT "FK_3d0a6c6d09b67f1b6d1f1f1d1f6"`);
        await queryRunner.query(`ALTER TABLE "delivery" DROP CONSTRAINT "FK_3d0a6c6d09b67f1b6d1f1f1d1f7"`);
        await queryRunner.query(`ALTER TYPE "public"."delivery_status_enum" RENAME TO "delivery_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."delivery_status_enum" AS ENUM('TO_DELIVER', 'SHIPPED', 'DELIVERED')`);
        await queryRunner.query(`ALTER TABLE "delivery" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "delivery" ALTER COLUMN "status" TYPE "public"."delivery_status_enum" USING (CASE WHEN "status"::text = 'PENDING' THEN 'TO_DELIVER' ELSE "status"::text END)::"public"."delivery_status_enum"`);
        await queryRunner.query(`ALTER TABLE "delivery" ALTER COLUMN "status" SET DEFAULT 'TO_DELIVER'`);
        await queryRunner.query(`DROP TYPE "public"."delivery_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "delivery" ADD CONSTRAINT "FK_e1dd06d37dd9bf4271417d002b9" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery" ADD CONSTRAINT "FK_3c2a746f1264d27c072de8a15bf" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery" DROP CONSTRAINT "FK_3c2a746f1264d27c072de8a15bf"`);
        await queryRunner.query(`ALTER TABLE "delivery" DROP CONSTRAINT "FK_e1dd06d37dd9bf4271417d002b9"`);
        await queryRunner.query(`CREATE TYPE "public"."delivery_status_enum_old" AS ENUM('PENDING', 'SHIPPED', 'DELIVERED')`);
        await queryRunner.query(`ALTER TABLE "delivery" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "delivery" ALTER COLUMN "status" TYPE "public"."delivery_status_enum_old" USING "status"::"text"::"public"."delivery_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "delivery" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."delivery_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."delivery_status_enum_old" RENAME TO "delivery_status_enum"`);
        await queryRunner.query(`ALTER TABLE "delivery" ADD CONSTRAINT "FK_3d0a6c6d09b67f1b6d1f1f1d1f7" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery" ADD CONSTRAINT "FK_3d0a6c6d09b67f1b6d1f1f1d1f6" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
