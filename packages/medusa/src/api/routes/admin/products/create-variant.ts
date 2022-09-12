import { Type } from "class-transformer"
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator"
import { defaultAdminProductFields, defaultAdminProductRelations } from "."
import { ProductService, ProductVariantService } from "../../../../services"
import { ProductVariantPricesCreateReq } from "../../../../types/product-variant"
import { validator } from "../../../../utils/validator"
import { EntityManager } from "typeorm"

/**
 * @oas [post] /products/{id}/variants
 * operationId: "PostProductsProductVariants"
 * summary: "Create a Product Variant"
 * description: "Creates a Product Variant. Each Product Variant must have a unique combination of Product Option Values."
 * x-authenticated: true
 * parameters:
 *   - (path) id=* {string} The id of the Product.
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         required:
 *           - title
 *           - prices
 *           - options
 *         properties:
 *           title:
 *             description: The title to identify the Product Variant by.
 *             type: string
 *           sku:
 *             description: The unique SKU for the Product Variant.
 *             type: string
 *           ean:
 *             description: The EAN number of the item.
 *             type: string
 *           upc:
 *             description: The UPC number of the item.
 *             type: string
 *           barcode:
 *             description: A generic GTIN field for the Product Variant.
 *             type: string
 *           hs_code:
 *             description: The Harmonized System code for the Product Variant.
 *             type: string
 *           inventory_quantity:
 *             description: The amount of stock kept for the Product Variant.
 *             type: integer
 *           allow_backorder:
 *             description: Whether the Product Variant can be purchased when out of stock.
 *             type: boolean
 *           manage_inventory:
 *             description: Whether Medusa should keep track of the inventory for this Product Variant.
 *             type: boolean
 *           weight:
 *             description: The wieght of the Product Variant.
 *             type: string
 *           length:
 *             description: The length of the Product Variant.
 *             type: string
 *           height:
 *             description: The height of the Product Variant.
 *             type: string
 *           width:
 *             description: The width of the Product Variant.
 *             type: string
 *           origin_country:
 *             description: The country of origin of the Product Variant.
 *             type: string
 *           mid_code:
 *             description: The Manufacturer Identification code for the Product Variant.
 *             type: string
 *           material:
 *             description: The material composition of the Product Variant.
 *             type: string
 *           metadata:
 *             description: An optional set of key-value pairs with additional information.
 *             type: object
 *           prices:
 *             type: array
 *             items:
 *               properties:
 *                 region_id:
 *                   description: The id of the Region for which the price is used.
 *                   type: string
 *                 currency_code:
 *                   description: The 3 character ISO currency code for which the price will be used.
 *                   type: string
 *                 amount:
 *                   description: The amount to charge for the Product Variant.
 *                   type: integer
 *                 min_quantity:
 *                   description: The minimum quantity for which the price will be used.
 *                   type: integer
 *                 max_quantity:
 *                   description: The maximum quantity for which the price will be used.
 *                   type: integer
 *           options:
 *             type: array
 *             items:
 *               properties:
 *                 option_id:
 *                   description: The id of the Product Option to set the value for.
 *                   type: string
 *                 value:
 *                   description: The value to give for the Product Option.
 *                   type: string
 * tags:
 *   - Product
 * responses:
 *   200:
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           properties:
 *             product:
 *               $ref: "#/components/schemas/product"
 */
export default async (req, res) => {
  const { id } = req.params

  const validated = await validator(
    AdminPostProductsProductVariantsReq,
    req.body
  )

  const productVariantService: ProductVariantService = req.scope.resolve(
    "productVariantService"
  )
  const productService: ProductService = req.scope.resolve("productService")

  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
    return await productVariantService
      .withTransaction(transactionManager)
      .create(id, validated)
  })

  const product = await productService.retrieve(id, {
    select: defaultAdminProductFields,
    relations: defaultAdminProductRelations,
  })

  res.json({ product })
}

class ProductVariantOptionReq {
  @IsString()
  value: string

  @IsString()
  option_id: string
}

export class AdminPostProductsProductVariantsReq {
  @IsString()
  title: string

  @IsString()
  @IsOptional()
  sku?: string

  @IsString()
  @IsOptional()
  ean?: string

  @IsString()
  @IsOptional()
  upc?: string

  @IsString()
  @IsOptional()
  barcode?: string

  @IsString()
  @IsOptional()
  hs_code?: string

  @IsNumber()
  @IsOptional()
  inventory_quantity = 0

  @IsBoolean()
  @IsOptional()
  allow_backorder?: boolean

  @IsBoolean()
  @IsOptional()
  manage_inventory?: boolean

  @IsNumber()
  @IsOptional()
  weight?: number

  @IsNumber()
  @IsOptional()
  length?: number

  @IsNumber()
  @IsOptional()
  height?: number

  @IsNumber()
  @IsOptional()
  width?: number

  @IsString()
  @IsOptional()
  origin_country?: string

  @IsString()
  @IsOptional()
  mid_code?: string

  @IsString()
  @IsOptional()
  material?: string

  @IsObject()
  @IsOptional()
  metadata?: object

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantPricesCreateReq)
  prices: ProductVariantPricesCreateReq[]

  @IsOptional()
  @Type(() => ProductVariantOptionReq)
  @ValidateNested({ each: true })
  @IsArray()
  options: ProductVariantOptionReq[] = []
}
