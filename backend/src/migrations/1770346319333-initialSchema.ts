import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770346319333 implements MigrationInterface {
    name = 'InitialSchema1770346319333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL, "img_url" text NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(150) NOT NULL, "email" character varying(150) NOT NULL, "phone_number" character varying(20) NOT NULL, CONSTRAINT "UQ_fdb2f3ad8115da4c7718109a6eb" UNIQUE ("email"), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_status_enum" AS ENUM('PENDING', 'APPROVED', 'DECLINED', 'ERROR')`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" integer NOT NULL, "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'PENDING', "amount" numeric(10,2) NOT NULL, "delivery_info" jsonb NOT NULL, "payment_info" jsonb, "payment_gateway_id" character varying, "customer_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_1801daeaeaaaef2aeb63ae80a67" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_2403d74bd6e5ca5a94e063c5506" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // Seed products
        await queryRunner.query(`
            INSERT INTO "product" ("name", "description", "price", "stock", "img_url") VALUES
            ('Jonathan Series X | Slate Edition', 'The perfect companion for your daily adventures. With its sleek design and powerful performance, the Jonathan Series X is ready for anything.', 4500000, 100, 'https://eshop-test-resources.s3.us-east-1.amazonaws.com/jonathan-series-x.png'),
            ('JG Vision Pro | Urban Connect', 'Experience the world in a new light with the JG Vision Pro. Its advanced optics and lightweight design make it the perfect companion for your daily adventures.', 3300000, 50, 'https://eshop-test-resources.s3.us-east-1.amazonaws.com/smart-glasses-jg.png'),
            ('Guerrero | Hydro-Tech DataBand', 'High-absorbency sweatband meets real-time biometric tracking for elite athletes. Stay dry and monitor your vitals without breaking your stride.', 1500000, 25, 'https://eshop-test-resources.s3.us-east-1.amazonaws.com/guerrero-hydro-tech-band.png')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_2403d74bd6e5ca5a94e063c5506"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_1801daeaeaaaef2aeb63ae80a67"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
