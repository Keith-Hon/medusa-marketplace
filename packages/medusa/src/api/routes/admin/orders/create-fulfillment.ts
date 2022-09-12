import { Transform, Type } from "class-transformer"
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator"
import { defaultAdminOrdersRelations, defaultAdminOrdersFields } from "."
import { OrderService } from "../../../../services"
import { validator } from "../../../../utils/validator"
import { EntityManager } from "typeorm"
/**
 * @oas [post] /orders/{id}/fulfillments
 * operationId: "PostOrdersOrderFulfillments"
 * summary: "Create a Fulfillment"
 * description: "Creates a Fulfillment of an Order - will notify Fulfillment Providers to prepare a shipment."
 * x-authenticated: true
 * parameters:
 *   - (path) id=* {string} The id of the Order.
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         required:
 *           - items
 *         properties:
 *           items:
 *             description: The Line Items to include in the Fulfillment.
 *             type: array
 *             items:
 *               properties:
 *                 item_id:
 *                   description: The id of Line Item to fulfill.
 *                   type: string
 *                 quantity:
 *                   description: The quantity of the Line Item to fulfill.
 *                   type: integer
 *           no_notification:
 *             description: If set to true no notification will be send related to this Swap.
 *             type: boolean
 *           metadata:
 *             description: An optional set of key-value pairs to hold additional information.
 *             type: object
 * tags:
 *   - Order
 * responses:
 *   200:
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           properties:
 *             order:
 *               $ref: "#/components/schemas/order"
 */
export default async (req, res) => {
  const { id } = req.params

  const validated = await validator(
    AdminPostOrdersOrderFulfillmentsReq,
    req.body
  )

  const orderService: OrderService = req.scope.resolve("orderService")

  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
    return await orderService
      .withTransaction(transactionManager)
      .createFulfillment(id, validated.items, {
        metadata: validated.metadata,
        no_notification: validated.no_notification,
      })
  })

  const order = await orderService.retrieve(id, {
    select: defaultAdminOrdersFields,
    relations: defaultAdminOrdersRelations,
  })

  res.json({ order })
}

export class AdminPostOrdersOrderFulfillmentsReq {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Item)
  items: Item[]

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === "true")
  no_notification?: boolean

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>
}

class Item {
  @IsString()
  @IsNotEmpty()
  item_id: string

  @IsInt()
  @IsNotEmpty()
  quantity: number
}
