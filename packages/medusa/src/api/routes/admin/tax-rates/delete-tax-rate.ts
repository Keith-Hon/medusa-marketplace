import { TaxRateService } from "../../../../services"
import { EntityManager } from "typeorm"

/**
 * @oas [delete] /tax-rates/{id}
 * operationId: "DeleteTaxRatesTaxRate"
 * summary: "Delete a Tax Rate"
 * description: "Deletes a Tax Rate"
 * x-authenticated: true
 * parameters:
 *   - (path) id=* {string} The id of the Shipping Option.
 * tags:
 *   - Tax Rates
 * responses:
 *   200:
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           properties:
 *             id:
 *               type: string
 *               description: The id of the deleted Shipping Option.
 *             object:
 *               type: string
 *               description: The type of the object that was deleted.
 *             deleted:
 *               type: boolean
 */
export default async (req, res) => {
  const { id } = req.params
  const taxRateService: TaxRateService = req.scope.resolve("taxRateService")

  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
    return await taxRateService.withTransaction(transactionManager).delete(id)
  })

  res.json({
    id: id,
    object: "tax-rate",
    deleted: true,
  })
}
