import { EntityManager } from "typeorm"
import { IdempotencyKey } from "../../../../models/idempotency-key"
import { CartService, IdempotencyKeyService } from "../../../../services"
import { decorateLineItemsWithTotals } from "./decorate-line-items-with-totals"

/**
 * @oas [post] /carts/{id}/taxes
 * summary: "Calculate Cart Taxes"
 * operationId: "PostCartsCartTaxes"
 * description: "Calculates taxes for a cart. Depending on the cart's region
 *   this may involve making 3rd party API calls to a Tax Provider service."
 * parameters:
 *   - (path) id=* {String} The Cart id.
 * tags:
 *   - Cart
 * responses:
 *   200:
 *     description: "A cart object with the tax_total field populated"
 *     content:
 *       application/json:
 *         schema:
 *           oneOf:
 *            - type: object
 *              properties:
 *                cart:
 *                  $ref: "#/components/schemas/cart"
 */
export default async (req, res) => {
  const { id } = req.params

  const idempotencyKeyService: IdempotencyKeyService = req.scope.resolve(
    "idempotencyKeyService"
  )
  const manager: EntityManager = req.scope.resolve("manager")

  const headerKey = req.get("Idempotency-Key") || ""

  let idempotencyKey!: IdempotencyKey
  try {
    await manager.transaction(async (transactionManager) => {
      idempotencyKey = await idempotencyKeyService
        .withTransaction(transactionManager)
        .initializeRequest(
          headerKey,
          req.method,
          req.params,
          req.path
        )
    })
  } catch (error) {
    console.log(error)
    res.status(409).send("Failed to create idempotency key")
    return
  }

  res.setHeader("Access-Control-Expose-Headers", "Idempotency-Key")
  res.setHeader("Idempotency-Key", idempotencyKey.idempotency_key)

  const cartService: CartService = req.scope.resolve("cartService")

  let inProgress = true
  let err = false

  while (inProgress) {
    switch (idempotencyKey.recovery_point) {
      case "started": {
        await manager.transaction(async (transactionManager) => {
          const { key, error } = await idempotencyKeyService
            .withTransaction(transactionManager)
            .workStage(
              idempotencyKey.idempotency_key,
              async (manager: EntityManager) => {
                const cart = await cartService.withTransaction(manager).retrieve(
                  id,
                  {
                    relations: ["items", "items.adjustments"],
                    select: [
                      "total",
                      "subtotal",
                      "tax_total",
                      "discount_total",
                      "shipping_total",
                      "gift_card_total",
                    ],
                  },
                  { force_taxes: true }
                )

                const data = await decorateLineItemsWithTotals(cart, req, {
                  force_taxes: true,
                })

                return {
                  response_code: 200,
                  response_body: { cart: data },
                }
              }
            )

          if (error) {
            inProgress = false
            err = error
          } else {
            idempotencyKey = key
          }
        })
        break
      }

      case "finished": {
        inProgress = false
        break
      }

      default:
        await manager.transaction(async (transactionManager) => {
          idempotencyKey = await idempotencyKeyService
            .withTransaction(transactionManager)
            .update(
              idempotencyKey.idempotency_key,
              {
                recovery_point: "finished",
                response_code: 500,
                response_body: { message: "Unknown recovery point" },
              }
            )
        })
        break
    }
  }

  if (err) {
    throw err
  }

  res.status(idempotencyKey.response_code).json(idempotencyKey.response_body)
}
