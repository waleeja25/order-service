import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOutboxMessagesTable1787586716000 implements MigrationInterface {
    name = 'CreateOutboxMessagesTable1787586716000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`outbox_messages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`eventType\` varchar(255) NOT NULL, \`payload\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`outbox_messages\``);
    }

}
