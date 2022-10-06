import { Column, Entity, Index, BeforeInsert } from "typeorm";
import { BaseEntity } from "@medusajs/medusa";
import { Entity as MedusaEntity } from "medusa-extender";
import { generateEntityId } from "@medusajs/medusa/dist/utils";

@MedusaEntity()
@Entity()
export class Company extends BaseEntity {
    @Index()
    @Column({ nullable: true })
    name: string;

    @BeforeInsert()
    private beforeInsert(): void {
        this.id = generateEntityId(this.id, "company");
    }
}
