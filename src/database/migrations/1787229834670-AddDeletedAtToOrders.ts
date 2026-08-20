import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtToOrders1787229834670 implements MigrationInterface {
    name = 'AddDeletedAtToOrders1787229834670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`deletedAt\` datetime(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`deletedAt\``);
    }

}
