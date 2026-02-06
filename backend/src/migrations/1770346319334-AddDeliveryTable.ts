import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliveryTable1770346319334 implements MigrationInterface {
    name = 'AddDeliveryTable1770346319334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."delivery_status_enum" AS ENUM('PENDING', 'SHIPPED', 'DELIVERED')`);
        await queryRunner.query(`CREATE TABLE "delivery" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transaction_id" uuid NOT NULL, "customer_id" uuid NOT NULL, "address" varchar(255) NOT NULL, "city" varchar(100) NOT NULL, "region" varchar(100) NOT NULL, "country" varchar(100) NOT NULL, "postal_code" varchar(20) NOT NULL, "status" "public"."delivery_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_3d0a6c6d09b67f1b6d1f1f1d1f" UNIQUE ("transaction_id"), CONSTRAINT "PK_3d0a6c6d09b67f1b6d1f1f1d1f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "delivery" ADD CONSTRAINT "FK_3d0a6c6d09b67f1b6d1f1f1d1f6" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery" ADD CONSTRAINT "FK_3d0a6c6d09b67f1b6d1f1f1d1f7" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery" DROP CONSTRAINT "FK_3d0a6c6d09b67f1b6d1f1f1d1f7"`);
        await queryRunner.query(`ALTER TABLE "delivery" DROP CONSTRAINT "FK_3d0a6c6d09b67f1b6d1f1f1d1f6"`);
        await queryRunner.query(`DROP TABLE "delivery"`);
        await queryRunner.query(`DROP TYPE "public"."delivery_status_enum"`);
    }
}
