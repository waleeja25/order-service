import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSentFlagsToOutboxMessages1787587606341 implements MigrationInterface {
    name = 'AddSentFlagsToOutboxMessages1787587606341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`outbox_messages\` ADD \`sentToRabbitMq\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`outbox_messages\` ADD \`sentToKafka\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`outbox_messages\` DROP COLUMN \`sentToKafka\``);
        await queryRunner.query(`ALTER TABLE \`outbox_messages\` DROP COLUMN \`sentToRabbitMq\``);
    }

}
