import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm"

import { Product } from "./product"
import { MoneyAmount } from "./money-amount"
import { ProductOptionValue } from "./product-option-value"
import { SoftDeletableEntity } from "../interfaces/models/soft-deletable-entity"
import { DbAwareColumn } from "../utils/db-aware-column"
import { generateEntityId } from "../utils/generate-entity-id"

@Entity()
export class ProductVariant extends SoftDeletableEntity {
  @Column()
  title: string

  @Index()
  @Column()
  product_id: string

  @ManyToOne(() => Product, (product) => product.variants, { eager: true })
  @JoinColumn({ name: "product_id" })
  product: Product

  @OneToMany(() => MoneyAmount, (ma) => ma.variant, {
    cascade: true,
    onDelete: "CASCADE",
  })
  prices: MoneyAmount[]

  @Column({ nullable: true })
  @Index({ unique: true, where: "deleted_at IS NULL" })
  sku: string

  @Column({ nullable: true })
  @Index({ unique: true, where: "deleted_at IS NULL" })
  barcode: string

  @Column({ nullable: true })
  @Index({ unique: true, where: "deleted_at IS NULL" })
  ean: string

  @Column({ nullable: true })
  @Index({ unique: true, where: "deleted_at IS NULL" })
  upc: string

  @Column({ nullable: true, default: 0, select: false })
  variant_rank: number

  @Column({ type: "int" })
  inventory_quantity: number

  @Column({ default: false })
  allow_backorder: boolean

  @Column({ default: true })
  manage_inventory: boolean

  @Column({ nullable: true })
  hs_code: string

  @Column({ nullable: true })
  origin_country: string

  @Column({ nullable: true })
  mid_code: string

  @Column({ nullable: true })
  material: string

  @Column({ type: "int", nullable: true })
  weight: number

  @Column({ type: "int", nullable: true })
  length: number

  @Column({ type: "int", nullable: true })
  height: number

  @Column({ type: "int", nullable: true })
  width: number

  @OneToMany(() => ProductOptionValue, (optionValue) => optionValue.variant, {
    cascade: true,
  })
  options: ProductOptionValue[]

  @DbAwareColumn({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "variant")
  }
}

/**
 * @schema product_variant
 * title: "Product Variant"
 * description: "Product Variants represent a Product with a specific set of Product Option configurations. The maximum number of Product Variants that a Product can have is given by the number of available Product Option combinations."
 * x-resourceId: product_variant
 * properties:
 *   id:
 *     description: "The id of the Product Variant. This value will be prefixed with `variant_`."
 *     type: string
 *   title:
 *     description: "A title that can be displayed for easy identification of the Product Variant."
 *     type: string
 *   product_id:
 *     description: "The id of the Product that the Product Variant belongs to."
 *     type: string
 *   prices:
 *     description: "The Money Amounts defined for the Product Variant. Each Money Amount represents a price in a given currency or a price in a specific Region."
 *     type: array
 *     items:
 *       $ref: "#/components/schemas/money_amount"
 *   sku:
 *     description: "The unique stock keeping unit used to identify the Product Variant. This will usually be a unqiue identifer for the item that is to be shipped, and can be referenced across multiple systems."
 *     type: string
 *   barcode:
 *     description: "A generic field for a GTIN number that can be used to identify the Product Variant."
 *     type: string
 *   ean:
 *     description: "An EAN barcode number that can be used to identify the Product Variant."
 *     type: string
 *   upc:
 *     description: "A UPC barcode number that can be used to identify the Product Variant."
 *     type: string
 *   inventory_quantity:
 *     description: "The current quantity of the item that is stocked."
 *     type: integer
 *   allow_backorder:
 *     description: "Whether the Product Variant should be purchasable when `inventory_quantity` is 0."
 *     type: boolean
 *   manage_inventory:
 *     description: "Whether Medusa should manage inventory for the Product Variant."
 *     type: boolean
 *   hs_code:
 *     description: "The Harmonized System code of the Product Variant. May be used by Fulfillment Providers to pass customs information to shipping carriers."
 *     type: string
 *   origin_country:
 *     description: "The country in which the Product Variant was produced. May be used by Fulfillment Providers to pass customs information to shipping carriers."
 *     type: string
 *   mid_code:
 *     description: "The Manufacturers Identification code that identifies the manufacturer of the Product Variant. May be used by Fulfillment Providers to pass customs information to shipping carriers."
 *     type: string
 *   material:
 *     description: "The material and composition that the Product Variant is made of, May be used by Fulfillment Providers to pass customs information to shipping carriers."
 *     type: string
 *   weight:
 *     description: "The weight of the Product Variant. May be used in shipping rate calculations."
 *     type: string
 *   height:
 *     description: "The height of the Product Variant. May be used in shipping rate calculations."
 *     type: string
 *   width:
 *     description: "The width of the Product Variant. May be used in shipping rate calculations."
 *     type: string
 *   length:
 *     description: "The length of the Product Variant. May be used in shipping rate calculations."
 *     type: string
 *   options:
 *     description: "The Product Option Values specified for the Product Variant."
 *     type: array
 *     items:
 *       $ref: "#/components/schemas/product_option_value"
 *   created_at:
 *     description: "The date with timezone at which the resource was created."
 *     type: string
 *     format: date-time
 *   updated_at:
 *     description: "The date with timezone at which the resource was last updated."
 *     type: string
 *     format: date-time
 *   deleted_at:
 *     description: "The date with timezone at which the resource was deleted."
 *     type: string
 *     format: date-time
 *   metadata:
 *     description: "An optional key-value map with additional information."
 *     type: object
 */
