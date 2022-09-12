import { MedusaError } from "medusa-core-utils"
import { EntityManager, FindOperator } from "typeorm"
import { CustomerGroupService } from "."
import { CustomerGroup, PriceList, Product, ProductVariant } from "../models"
import { MoneyAmountRepository } from "../repositories/money-amount"
import {
  PriceListFindOptions,
  PriceListRepository,
} from "../repositories/price-list"
import { FindConfig, Selector } from "../types/common"
import {
  CreatePriceListInput,
  FilterablePriceListProps,
  PriceListPriceCreateInput,
  PriceListPriceUpdateInput,
  UpdatePriceListInput,
} from "../types/price-list"
import { formatException } from "../utils/exception-formatter"
import ProductService from "./product"
import RegionService from "./region"
import { TransactionBaseService } from "../interfaces"
import { buildQuery } from "../utils"
import { FilterableProductProps } from "../types/product"
import ProductVariantService from "./product-variant"
import { FilterableProductVariantProps } from "../types/product-variant"
import { ProductVariantRepository } from "../repositories/product-variant"

type PriceListConstructorProps = {
  manager: EntityManager
  customerGroupService: CustomerGroupService
  regionService: RegionService
  productService: ProductService
  productVariantService: ProductVariantService
  priceListRepository: typeof PriceListRepository
  moneyAmountRepository: typeof MoneyAmountRepository
  productVariantRepository: typeof ProductVariantRepository
}

/**
 * Provides layer to manipulate product tags.
 * @extends BaseService
 */
class PriceListService extends TransactionBaseService<PriceListService> {
  protected manager_: EntityManager
  protected transactionManager_: EntityManager | undefined

  protected readonly customerGroupService_: CustomerGroupService
  protected readonly regionService_: RegionService
  protected readonly productService_: ProductService
  protected readonly variantService_: ProductVariantService
  protected readonly priceListRepo_: typeof PriceListRepository
  protected readonly moneyAmountRepo_: typeof MoneyAmountRepository
  protected readonly productVariantRepo_: typeof ProductVariantRepository

  constructor({
    manager,
    customerGroupService,
    regionService,
    productService,
    productVariantService,
    priceListRepository,
    moneyAmountRepository,
    productVariantRepository,
  }: PriceListConstructorProps) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])

    this.manager_ = manager
    this.customerGroupService_ = customerGroupService
    this.productService_ = productService
    this.variantService_ = productVariantService
    this.regionService_ = regionService
    this.priceListRepo_ = priceListRepository
    this.moneyAmountRepo_ = moneyAmountRepository
    this.productVariantRepo_ = productVariantRepository
  }

  /**
   * Retrieves a product tag by id.
   * @param {string} priceListId - the id of the product tag to retrieve
   * @param {Object} config - the config to retrieve the tag by
   * @return {Promise<PriceList>} the collection.
   */
  async retrieve(
    priceListId: string,
    config: FindConfig<PriceList> = {}
  ): Promise<PriceList> {
    const priceListRepo = this.manager_.getCustomRepository(this.priceListRepo_)

    const query = buildQuery({ id: priceListId }, config)
    const priceList = await priceListRepo.findOne(query)

    if (!priceList) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Price list with id: ${priceListId} was not found`
      )
    }

    return priceList
  }

  /**
   * Creates a Price List
   * @param {CreatePriceListInput} priceListObject - the Price List to create
   * @return {Promise<PriceList>} created Price List
   */
  async create(priceListObject: CreatePriceListInput): Promise<PriceList> {
    return await this.atomicPhase_(async (manager: EntityManager) => {
      const priceListRepo = manager.getCustomRepository(this.priceListRepo_)
      const moneyAmountRepo = manager.getCustomRepository(this.moneyAmountRepo_)

      const { prices, customer_groups, ...rest } = priceListObject

      try {
        const entity = priceListRepo.create(rest)

        const priceList = await priceListRepo.save(entity)

        if (prices) {
          await moneyAmountRepo.addPriceListPrices(priceList.id, prices)
        }

        if (customer_groups) {
          await this.upsertCustomerGroups_(priceList.id, customer_groups)
        }

        const result = await this.retrieve(priceList.id, {
          relations: ["prices", "customer_groups"],
        })

        return result
      } catch (error) {
        throw formatException(error)
      }
    })
  }

  /**
   * Updates a Price List
   * @param {string} id - the id of the Product List to update
   * @param {UpdatePriceListInput} update - the update to apply
   * @returns {Promise<PriceList>} updated Price List
   */
  async update(id: string, update: UpdatePriceListInput): Promise<PriceList> {
    return await this.atomicPhase_(async (manager: EntityManager) => {
      const priceListRepo = manager.getCustomRepository(this.priceListRepo_)
      const moneyAmountRepo = manager.getCustomRepository(this.moneyAmountRepo_)

      const priceList = await this.retrieve(id, { select: ["id"] })

      const { prices, customer_groups, ...rest } = update

      if (prices) {
        const prices_ = await this.addCurrencyFromRegion(prices)
        await moneyAmountRepo.updatePriceListPrices(id, prices_)
      }

      if (customer_groups) {
        await this.upsertCustomerGroups_(id, customer_groups)
      }

      for (const [key, value] of Object.entries(rest)) {
        if (typeof value === "undefined") {
          continue
        }

        priceList[key] = value
      }

      await priceListRepo.save(priceList)

      return await this.retrieve(id, {
        relations: ["prices", "customer_groups"],
      })
    })
  }

  /**
   * Adds prices to a price list in bulk, optionally replacing all existing prices
   * @param id - id of the price list
   * @param prices - prices to add
   * @param replace - whether to replace existing prices
   * @returns {Promise<PriceList>} updated Price List
   */
  async addPrices(
    id: string,
    prices: PriceListPriceCreateInput[],
    replace = false
  ): Promise<PriceList> {
    return await this.atomicPhase_(async (manager: EntityManager) => {
      const moneyAmountRepo = manager.getCustomRepository(this.moneyAmountRepo_)

      const priceList = await this.retrieve(id, { select: ["id"] })

      const prices_ = await this.addCurrencyFromRegion(prices)
      await moneyAmountRepo.addPriceListPrices(priceList.id, prices_, replace)

      return await this.retrieve(priceList.id, {
        relations: ["prices"],
      })
    })
  }

  /**
   * Removes prices from a price list and deletes the removed prices in bulk
   * @param id - id of the price list
   * @param priceIds - ids of the prices to delete
   * @returns {Promise<void>} updated Price List
   */
  async deletePrices(id: string, priceIds: string[]): Promise<void> {
    return await this.atomicPhase_(async (manager: EntityManager) => {
      const moneyAmountRepo = manager.getCustomRepository(this.moneyAmountRepo_)

      const priceList = await this.retrieve(id, { select: ["id"] })

      await moneyAmountRepo.deletePriceListPrices(priceList.id, priceIds)
    })
  }

  /**
   * Deletes a Price List
   * Will never fail due to delete being idempotent.
   * @param id - id of the price list
   * @returns {Promise<void>} empty promise
   */
  async delete(id: string): Promise<void> {
    return await this.atomicPhase_(async (manager: EntityManager) => {
      const priceListRepo = manager.getCustomRepository(this.priceListRepo_)

      const priceList = await priceListRepo.findOne({ where: { id: id } })

      if (!priceList) {
        return Promise.resolve()
      }

      await priceListRepo.remove(priceList)
    })
  }

  /**
   * Lists Price Lists
   * @param {Object} selector - the query object for find
   * @param {Object} config - the config to be used for find
   * @return {Promise<PriceList[]>} the result of the find operation
   */
  async list(
    selector: FilterablePriceListProps = {},
    config: FindConfig<FilterablePriceListProps> = { skip: 0, take: 20 }
  ): Promise<PriceList[]> {
    const manager = this.manager_
    const priceListRepo = manager.getCustomRepository(this.priceListRepo_)

    const { q, ...priceListSelector } = selector
    const query = buildQuery(priceListSelector, config)

    const groups = query.where.customer_groups as FindOperator<string[]>
    query.where.customer_groups = undefined

    const [priceLists] = await priceListRepo.listAndCount(query, groups)

    return priceLists
  }

  /**
   * Lists Price Lists and adds count
   * @param {Object} selector - the query object for find
   * @param {Object} config - the config to be used for find
   * @return {Promise} the result of the find operation
   */
  async listAndCount(
    selector: FilterablePriceListProps = {},
    config: FindConfig<FilterablePriceListProps> = {
      skip: 0,
      take: 20,
    }
  ): Promise<[PriceList[], number]> {
    const manager = this.manager_
    const priceListRepo = manager.getCustomRepository(this.priceListRepo_)
    const { q, ...priceListSelector } = selector
    const { relations, ...query } = buildQuery<
      FilterablePriceListProps,
      FilterablePriceListProps
    >(priceListSelector, config)

    const groups = query.where.customer_groups as FindOperator<string[]>
    delete query.where.customer_groups

    if (q) {
      return await priceListRepo.getFreeTextSearchResultsAndCount(
        q,
        query as PriceListFindOptions,
        groups,
        relations
      )
    }
    return await priceListRepo.listAndCount({ ...query, relations }, groups)
  }

  protected async upsertCustomerGroups_(
    priceListId: string,
    customerGroups: { id: string }[]
  ): Promise<void> {
    const priceListRepo = this.manager_.getCustomRepository(this.priceListRepo_)
    const priceList = await this.retrieve(priceListId, { select: ["id"] })

    const groups: CustomerGroup[] = []

    for (const cg of customerGroups) {
      const customerGroup = await this.customerGroupService_.retrieve(cg.id)
      groups.push(customerGroup)
    }

    priceList.customer_groups = groups

    await priceListRepo.save(priceList)
  }

  async listProducts(
    priceListId: string,
    selector: FilterableProductProps | Selector<Product> = {},
    config: FindConfig<Product> = {
      relations: [],
      skip: 0,
      take: 20,
    },
    requiresPriceList = false
  ): Promise<[Product[], number]> {
    return await this.atomicPhase_(async (manager: EntityManager) => {
      const productVariantRepo = manager.getCustomRepository(
        this.productVariantRepo_
      )
      const [products, count] = await this.productService_
        .withTransaction(manager)
        .listAndCount(selector, config)

      const moneyAmountRepo = manager.getCustomRepository(this.moneyAmountRepo_)

      const productsWithPrices = await Promise.all(
        products.map(async (p) => {
          if (p.variants?.length) {
            p.variants = await Promise.all(
              p.variants.map(async (v) => {
                const [prices] =
                  await moneyAmountRepo.findManyForVariantInPriceList(
                    v.id,
                    priceListId,
                    requiresPriceList
                  )

                return productVariantRepo.create({
                  ...v,
                  prices,
                })
              })
            )
          }

          return p
        })
      )

      return [productsWithPrices, count]
    })
  }

  async listVariants(
    priceListId: string,
    selector: FilterableProductVariantProps = {},
    config: FindConfig<ProductVariant> = {
      relations: [],
      skip: 0,
      take: 20,
    },
    requiresPriceList = false
  ): Promise<[ProductVariant[], number]> {
    return await this.atomicPhase_(async (manager: EntityManager) => {
      const [variants, count] = await this.variantService_
        .withTransaction(manager)
        .listAndCount(selector, config)

      const moneyAmountRepo = manager.getCustomRepository(this.moneyAmountRepo_)

      const variantsWithPrices = await Promise.all(
        variants.map(async (variant) => {
          const [prices] = await moneyAmountRepo.findManyForVariantInPriceList(
            variant.id,
            priceListId,
            requiresPriceList
          )

          variant.prices = prices
          return variant
        })
      )

      return [variantsWithPrices, count]
    })
  }

  public async deleteProductPrices(
    priceListId: string,
    productIds: string[]
  ): Promise<[string[], number]> {
    return await this.atomicPhase_(async () => {
      const [products, count] = await this.listProducts(
        priceListId,
        {
          id: productIds,
        },
        {
          relations: ["variants"],
        },
        true
      )

      if (count === 0) {
        return [[], count]
      }

      const priceIds = products
        .map(({ variants }) =>
          variants
            .map((variant) => variant.prices.map((price) => price.id))
            .flat()
        )
        .flat()

      if (!priceIds.length) {
        return [[], 0]
      }

      await this.deletePrices(priceListId, priceIds)
      return [priceIds, priceIds.length]
    })
  }

  public async deleteVariantPrices(
    priceListId: string,
    variantIds: string[]
  ): Promise<[string[], number]> {
    return await this.atomicPhase_(async () => {
      const [variants, count] = await this.listVariants(
        priceListId,
        {
          id: variantIds,
        },
        {},
        true
      )

      if (count === 0) {
        return [[], count]
      }

      const priceIds = variants
        .map((variant) => variant.prices.map((price) => price.id))
        .flat()

      if (!priceIds.length) {
        return [[], 0]
      }

      await this.deletePrices(priceListId, priceIds)
      return [priceIds, priceIds.length]
    })
  }

  /**
   * Add `currency_code` to an MA record if `region_id`is passed.
   * @param prices - a list of PriceListPrice(Create/Update)Input records
   * @return {Promise} updated `prices` list
   */
  protected async addCurrencyFromRegion<
    T extends PriceListPriceUpdateInput | PriceListPriceCreateInput
  >(prices: T[]): Promise<T[]> {
    const prices_: typeof prices = []

    for (const p of prices) {
      if (p.region_id) {
        const region = await this.regionService_
          .withTransaction(this.manager_)
          .retrieve(p.region_id)

        p.currency_code = region.currency_code
      }

      prices_.push(p)
    }

    return prices_
  }
}

export default PriceListService
