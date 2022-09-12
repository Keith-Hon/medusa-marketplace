import { MigrationInterface, QueryRunner } from "typeorm";
import { Migration } from "medusa-extender";
import { TableForeignKey } from "typeorm";

@Migration()
export class RoleMigration1661407989236 implements MigrationInterface {
    name = "RoleMigration1661407989236";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `
        CREATE TABLE "role" ("id" character varying NOT NULL, 
        "name" character varying NOT NULL, "store_id" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now())
        `;
        await queryRunner.query(query);

        await queryRunner.createPrimaryKey("role", ["id"]);
        await queryRunner.createForeignKey(
            "role",
            new TableForeignKey({
                columnNames: ["store_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "store",
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("role", true);
    }
}
