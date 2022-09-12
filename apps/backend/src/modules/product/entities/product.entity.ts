import { Product as MedusaProduct } from "@medusajs/medusa/dist";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Entity as MedusaEntity } from "medusa-extender";
import { Store } from "../../store/entities/store.entity";

@MedusaEntity({ override: MedusaProduct })
@Entity()
export class Product extends MedusaProduct {
    @Index()
    @Column({ nullable: false })
    store_id: string;

    @ManyToOne(() => Store, (store) => store.members)
    @JoinColumn({ name: "store_id", referencedColumnName: "id" })
    store: Store;
}
