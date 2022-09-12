import { Router } from "express"
import "reflect-metadata"
import { Discount } from "../../../.."
import { DiscountCondition } from "../../../../models"
import { DeleteResponse, PaginatedResponse } from "../../../../types/common"
import middlewares from "../../../middlewares"

const route = Router()

export default (app) => {
  app.use("/discounts", route)

  route.get("/", middlewares.wrap(require("./list-discounts").default))
  route.post("/", middlewares.wrap(require("./create-discount").default))

  route.get(
    "/:discount_id",
    middlewares.wrap(require("./get-discount").default)
  )
  route.get(
    "/code/:code",
    middlewares.wrap(require("./get-discount-by-code").default)
  )
  route.post(
    "/:discount_id",
    middlewares.wrap(require("./update-discount").default)
  )
  route.delete(
    "/:discount_id",
    middlewares.wrap(require("./delete-discount").default)
  )

  // Dynamic codes
  route.post(
    "/:discount_id/dynamic-codes",
    middlewares.wrap(require("./create-dynamic-code").default)
  )
  route.delete(
    "/:discount_id/dynamic-codes/:code",
    middlewares.wrap(require("./delete-dynamic-code").default)
  )

  // Discount region management
  route.post(
    "/:discount_id/regions/:region_id",
    middlewares.wrap(require("./add-region").default)
  )
  route.delete(
    "/:discount_id/regions/:region_id",
    middlewares.wrap(require("./remove-region").default)
  )

  // Discount condition management
  route.get(
    "/:discount_id/conditions/:condition_id",
    middlewares.wrap(require("./get-condition").default)
  )
  route.post(
    "/:discount_id/conditions/:condition_id",
    middlewares.wrap(require("./update-condition").default)
  )
  route.post(
    "/:discount_id/conditions",
    middlewares.wrap(require("./create-condition").default)
  )
  route.delete(
    "/:discount_id/conditions/:condition_id",
    middlewares.wrap(require("./delete-condition").default)
  )

  return app
}

export const defaultAdminDiscountsFields: (keyof Discount)[] = [
  "id",
  "code",
  "is_dynamic",
  "is_disabled",
  "rule_id",
  "parent_discount_id",
  "usage_limit",
  "usage_count",
  "starts_at",
  "ends_at",
  "created_at",
  "updated_at",
  "deleted_at",
  "metadata",
  "valid_duration",
]

export const defaultAdminDiscountsRelations = [
  "rule",
  "parent_discount",
  "regions",
  "rule.conditions",
]

export const defaultAdminDiscountConditionFields: (keyof DiscountCondition)[] =
  ["id", "type", "operator", "discount_rule_id", "created_at", "updated_at"]

export const defaultAdminDiscountConditionRelations = ["discount_rule"]

export type AdminDiscountsRes = {
  discount: Discount
}

export type AdminDiscountConditionsRes = {
  discount_condition: DiscountCondition
}

export type AdminDiscountsDeleteRes = DeleteResponse

export type AdminDiscountsListRes = PaginatedResponse & {
  discounts: Discount[]
}

export * from "./add-region"
export * from "./create-condition"
export * from "./create-discount"
export * from "./create-dynamic-code"
export * from "./delete-condition"
export * from "./delete-discount"
export * from "./delete-dynamic-code"
export * from "./get-condition"
export * from "./get-discount"
export * from "./get-discount-by-code"
export * from "./list-discounts"
export * from "./remove-region"
export * from "./update-condition"
export * from "./update-discount"
