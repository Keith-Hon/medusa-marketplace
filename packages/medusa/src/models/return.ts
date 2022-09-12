import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm"
import { DbAwareColumn, resolveDbType } from "../utils/db-aware-column"

import { Order } from "./order"
import { Swap } from "./swap"
import { ClaimOrder } from "./claim-order"
import { ReturnItem } from "./return-item"
import { ShippingMethod } from "./shipping-method"
import { BaseEntity } from "../interfaces/models/base-entity"
import { generateEntityId } from "../utils/generate-entity-id"

export enum ReturnStatus {
  REQUESTED = "requested",
  RECEIVED = "received",
  REQUIRES_ACTION = "requires_action",
  CANCELED = "canceled",
}

@Entity()
export class Return extends BaseEntity {
  @DbAwareColumn({
    type: "enum",
    enum: ReturnStatus,
    default: ReturnStatus.REQUESTED,
  })
  status: ReturnStatus

  @OneToMany(() => ReturnItem, (item) => item.return_order, {
    eager: true,
    cascade: ["insert"],
  })
  items: ReturnItem[]

  @Index()
  @Column({ nullable: true })
  swap_id: string

  @OneToOne(() => Swap, (swap) => swap.return_order)
  @JoinColumn({ name: "swap_id" })
  swap: Swap

  @Index()
  @Column({ nullable: true })
  claim_order_id: string

  @OneToOne(() => ClaimOrder, (co) => co.return_order)
  @JoinColumn({ name: "claim_order_id" })
  claim_order: ClaimOrder

  @Index()
  @Column({ nullable: true })
  order_id: string

  @ManyToOne(() => Order, (o) => o.returns)
  @JoinColumn({ name: "order_id" })
  order: Order

  @OneToOne(() => ShippingMethod, (method) => method.return_order, {
    cascade: true,
  })
  shipping_method: ShippingMethod

  @DbAwareColumn({ type: "jsonb", nullable: true })
  shipping_data: Record<string, unknown>

  @Column({ type: "int" })
  refund_amount: number

  @Column({ type: resolveDbType("timestamptz"), nullable: true })
  received_at: Date

  @Column({ type: "boolean", nullable: true })
  no_notification: boolean

  @DbAwareColumn({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>

  @Column({ nullable: true })
  idempotency_key: string

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "ret")
  }
}

/**
 * @schema return
 * title: "Return"
 * description: "Return orders hold information about Line Items that a Customer wishes to send back, along with how the items will be returned. Returns can be used as part of a Swap."
 * x-resourceId: return
 * properties:
 *   id:
 *     description: "The id of the Return. This value will be prefixed with `ret_`."
 *     type: string
 *   status:
 *     description: "Status of the Return."
 *     type: string
 *     enum:
 *       - requested
 *       - received
 *       - requires_action
 *   items:
 *     description: "The Return Items that will be shipped back to the warehouse.
 *     type: array
 *     items:
 *       $ref: "#/components/schemas/return_item"
 *   swap_id:
 *     description: "The id of the Swap that the Return is a part of."
 *     type: string
 *   order_id:
 *     description: "The id of the Order that the Return is made from."
 *     type: string
 *   claim_order_id:
 *     description: "The id of the Claim that the Return is a part of."
 *     type: string
 *   shipping_method:
 *     description: "The Shipping Method that will be used to send the Return back. Can be null if the Customer facilitates the return shipment themselves."
 *     anyOf:
 *       - $ref: "#/components/schemas/shipping_method"
 *   shipping_data:
 *     description: "Data about the return shipment as provided by the Fulfilment Provider that handles the return shipment."
 *     type: object
 *   refund_amount:
 *     description: "The amount that should be refunded as a result of the return."
 *     type: integer
 *   received_at:
 *     description: "The date with timezone at which the return was received."
 *     type: string
 *     format: date-time
 *   created_at:
 *     description: "The date with timezone at which the resource was created."
 *     type: string
 *     format: date-time
 *   updated_at:
 *     description: "The date with timezone at which the resource was last updated."
 *     type: string
 *     format: date-time
 *   no_notification:
 *     description: "When set to true, no notification will be sent related to this return."
 *     type: boolean
 *   metadata:
 *     description: "An optional key-value map with additional information."
 *     type: object
 */
