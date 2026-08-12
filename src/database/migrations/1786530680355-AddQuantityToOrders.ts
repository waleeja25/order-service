import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuantityToOrders1786530680355 implements MigrationInterface {
    name = 'AddQuantityToOrders1786530680355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`quantity\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`quantity\``);
    }

}
