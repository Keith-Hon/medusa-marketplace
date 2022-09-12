import { defaultStoreGiftCardFields, defaultStoreGiftCardRelations } from "."
import GiftCardService from "../../../../services/gift-card"

/**
 * @oas [get] /gift-cards/{code}
 * operationId: "GetGiftCardsCode"
 * summary: "Retrieve Gift Card by Code"
 * description: "Retrieves a Gift Card by its associated unqiue code."
 * parameters:
 *   - (path) code=* {string} The unique Gift Card code.
 * tags:
 *   - Gift Card
 * responses:
 *   200:
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           properties:
 *             id:
 *               description: The id of the Gift Card
 *             code:
 *               description: The code of the Gift Card
 *             value:
 *               description: The original value of the Gift Card.
 *             balance:
 *               description: The current balanace of the Gift Card
 *             region:
 *               $ref: "#/components/schemas/region"
 */
export default async (req, res) => {
  const { code } = req.params

  try {
    const giftCardService: GiftCardService =
      req.scope.resolve("giftCardService")
    const giftCard = await giftCardService.retrieveByCode(code, {
      select: defaultStoreGiftCardFields,
      relations: defaultStoreGiftCardRelations,
    })

    res.json({ gift_card: giftCard })
  } catch (error) {
    console.log(error)
    throw error
  }
}
