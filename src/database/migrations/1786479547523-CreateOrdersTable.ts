import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrdersTable1786479547523 implements MigrationInterface {
    name = 'CreateOrdersTable1786479547523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NOT NULL, \`productId\` int NOT NULL, \`totalAmount\` decimal(10,2) NOT NULL, INDEX \`IDX_151b79a83ba240b0cb31b2302d\` (\`userId\`), INDEX \`IDX_8624dad595ae567818ad9983b3\` (\`productId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_8624dad595ae567818ad9983b3\` ON \`orders\``);
        await queryRunner.query(`DROP INDEX \`IDX_151b79a83ba240b0cb31b2302d\` ON \`orders\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
    }

}
