import { Transform, Type } from "class-transformer"
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from "class-validator"
import { DiscountConditionOperator } from "../models/discount-condition"
import { AllocationType, DiscountRuleType } from "../models/discount-rule"
import { ExactlyOne } from "./validators/exactly-one"
import { Region } from "../models"

export type QuerySelector = {
  q?: string
}

export class FilterableDiscountProps {
  @IsString()
  @IsOptional()
  q?: string

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === "true")
  is_dynamic?: boolean

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === "true")
  is_disabled?: boolean

  @ValidateNested()
  @IsOptional()
  @Type(() => AdminGetDiscountsDiscountRuleParams)
  rule?: AdminGetDiscountsDiscountRuleParams
}

export class AdminGetDiscountsDiscountRuleParams {
  @IsOptional()
  @IsEnum(DiscountRuleType)
  type?: DiscountRuleType

  @IsOptional()
  @IsEnum(AllocationType)
  allocation?: AllocationType
}

export class AdminUpsertConditionsReq {
  @Validate(ExactlyOne, [
    "product_collections",
    "product_types",
    "product_tags",
    "customer_groups",
  ])
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  products?: string[]

  @Validate(ExactlyOne, [
    "products",
    "product_types",
    "product_tags",
    "customer_groups",
  ])
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  product_collections?: string[]

  @Validate(ExactlyOne, [
    "product_collections",
    "products",
    "product_tags",
    "customer_groups",
  ])
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  product_types?: string[]

  @Validate(ExactlyOne, [
    "product_collections",
    "product_types",
    "products",
    "customer_groups",
  ])
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  product_tags?: string[]

  @Validate(ExactlyOne, [
    "product_collections",
    "product_types",
    "products",
    "product_tags",
  ])
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  customer_groups?: string[]
}

export type UpsertDiscountConditionInput = {
  rule_id?: string
  id?: string
  operator?: DiscountConditionOperator
  products?: string[]
  product_collections?: string[]
  product_types?: string[]
  product_tags?: string[]
  customer_groups?: string[]
}

export type CreateDiscountRuleInput = {
  description?: string
  type: DiscountRuleType
  value: number
  allocation: AllocationType
  conditions?: UpsertDiscountConditionInput[]
}

export type CreateDiscountInput = {
  code: string
  rule: CreateDiscountRuleInput
  is_dynamic: boolean
  is_disabled: boolean
  starts_at?: Date
  ends_at?: Date
  valid_duration?: string
  usage_limit?: number
  regions?: string[] | Region[]
  metadata?: Record<string, unknown>
}

export type UpdateDiscountRuleInput = {
  id: string
  description?: string
  value?: number
  allocation?: AllocationType
  conditions?: UpsertDiscountConditionInput[]
}

export type UpdateDiscountInput = {
  code?: string
  rule?: UpdateDiscountRuleInput
  is_disabled?: boolean
  starts_at?: Date
  ends_at?: Date | null
  valid_duration?: string | null
  usage_limit?: number | null
  regions?: string[]
  metadata?: Record<string, unknown>
}

export type CreateDynamicDiscountInput = {
  code: string
  ends_at?: Date
  usage_limit: number
  metadata?: object
}
