import jwt from "jsonwebtoken"
import { MedusaError } from "medusa-core-utils"
import Scrypt from "scrypt-kdf"
import { DeepPartial, EntityManager } from "typeorm"
import { StorePostCustomersCustomerAddressesAddressReq } from "../api"
import { TransactionBaseService } from "../interfaces"
import { Address, Customer, CustomerGroup } from "../models"
import { AddressRepository } from "../repositories/address"
import { CustomerRepository } from "../repositories/customer"
import { AddressCreatePayload, FindConfig, Selector } from "../types/common"
import { CreateCustomerInput, UpdateCustomerInput } from "../types/customers"
import { buildQuery, setMetadata } from "../utils"
import { formatException } from "../utils/exception-formatter"
import EventBusService from "./event-bus"

type InjectedDependencies = {
  manager: EntityManager
  eventBusService: EventBusService
  customerRepository: typeof CustomerRepository
  addressRepository: typeof AddressRepository
}
/**
 * Provides layer to manipulate customers.
 */
class CustomerService extends TransactionBaseService<CustomerService> {
  protected readonly customerRepository_: typeof CustomerRepository
  protected readonly addressRepository_: typeof AddressRepository
  protected readonly eventBusService_: EventBusService

  protected readonly manager_: EntityManager
  protected readonly transactionManager_: EntityManager | undefined

  static Events = {
    PASSWORD_RESET: "customer.password_reset",
    CREATED: "customer.created",
    UPDATED: "customer.updated",
  }

  constructor({
    manager,
    customerRepository,
    eventBusService,
    addressRepository,
  }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])

    this.manager_ = manager

    this.customerRepository_ = customerRepository
    this.eventBusService_ = eventBusService
    this.addressRepository_ = addressRepository
  }

  /**
   * Generate a JSON Web token, that will be sent to a customer, that wishes to
   * reset password.
   * The token will be signed with the customer's current password hash as a
   * secret a long side a payload with userId and the expiry time for the token,
   * which is always 15 minutes.
   * @param {string} customerId - the customer to reset the password for
   * @return {string} the generated JSON web token
   */
  async generateResetPasswordToken(customerId: string): Promise<string> {
    return await this.atomicPhase_(async (manager) => {
      const customer = await this.retrieve(customerId, {
        select: [
          "id",
          "has_account",
          "password_hash",
          "email",
          "first_name",
          "last_name",
        ],
      })

      if (!customer.has_account) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          "You must have an account to reset the password. Create an account first"
        )
      }

      const secret = customer.password_hash
      const expiry = Math.floor(Date.now() / 1000) + 60 * 15 // 15 minutes ahead
      const payload = { customer_id: customer.id, exp: expiry }
      const token = jwt.sign(payload, secret)
      // Notify subscribers
      this.eventBusService_
        .withTransaction(manager)
        .emit(CustomerService.Events.PASSWORD_RESET, {
          id: customerId,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          token,
        })
      return token
    })
  }

  /**
   * @param {Object} selector - the query object for find
   * @param {Object} config - the config object containing query settings
   * @return {Promise} the result of the find operation
   */
  async list(
    selector: Selector<Customer> & { q?: string } = {},
    config: FindConfig<Customer> = { relations: [], skip: 0, take: 50 }
  ): Promise<Customer[]> {
    const manager = this.manager_
    const customerRepo = manager.getCustomRepository(this.customerRepository_)

    let q
    if ("q" in selector) {
      q = selector.q
      delete selector.q
    }

    const query = buildQuery<Selector<Customer>, Customer>(selector, config)

    const [customers] = await customerRepo.listAndCount(query, q)
    return customers
  }

  /**
   * @param {Object} selector - the query object for find
   * @param {FindConfig<Customer>} config - the config object containing query settings
   * @return {Promise} the result of the find operation
   */
  async listAndCount(
    selector: Selector<Customer> & { q?: string },
    config: FindConfig<Customer> = {
      relations: [],
      skip: 0,
      take: 50,
      order: { created_at: "DESC" },
    }
  ): Promise<[Customer[], number]> {
    const manager = this.manager_
    const customerRepo = manager.getCustomRepository(this.customerRepository_)

    let q
    if ("q" in selector) {
      q = selector.q
      delete selector.q
    }

    const query = buildQuery<Selector<Customer>, Customer>(selector, config)

    return await customerRepo.listAndCount(query, q)
  }

  /**
   * Return the total number of documents in database
   * @return {Promise} the result of the count operation
   */
  async count(): Promise<number> {
    const manager = this.manager_
    const customerRepo = manager.getCustomRepository(this.customerRepository_)
    return await customerRepo.count({})
  }

  private async retrieve_(
    selector: Selector<Customer>,
    config: FindConfig<Customer> = {}
  ): Promise<Customer | never> {
    const manager = this.transactionManager_ ?? this.manager_

    const customerRepo = manager.getCustomRepository(this.customerRepository_)

    const query = buildQuery(selector, config)
    const customer = await customerRepo.findOne(query)

    if (!customer) {
      const selectorConstraints = Object.entries(selector)
        .map((key, value) => `${key}: ${value}`)
        .join(", ")
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Customer with ${selectorConstraints} was not found`
      )
    }

    return customer
  }

  /**
   * Gets a customer by email.
   * @param {string} email - the email of the customer to get.
   * @param {Object} config - the config object containing query settings
   * @return {Promise<Customer>} the customer document.
   */
  async retrieveByEmail(
    email: string,
    config: FindConfig<Customer> = {}
  ): Promise<Customer | never> {
    return await this.retrieve_({ email: email.toLowerCase() }, config)
  }

  /**
   * Gets a customer by phone.
   * @param {string} phone - the phone of the customer to get.
   * @param {Object} config - the config object containing query settings
   * @return {Promise<Customer>} the customer document.
   */
  async retrieveByPhone(
    phone: string,
    config: FindConfig<Customer> = {}
  ): Promise<Customer | never> {
    return await this.retrieve_({ phone }, config)
  }

  /**
   * Gets a customer by id.
   * @param {string} customerId - the id of the customer to get.
   * @param {Object} config - the config object containing query settings
   * @return {Promise<Customer>} the customer document.
   */
  async retrieve(
    customerId: string,
    config: FindConfig<Customer> = {}
  ): Promise<Customer> {
    return this.retrieve_({ id: customerId }, config)
  }

  /**
   * Hashes a password
   * @param {string} password - the value to hash
   * @return {Promise<string>} hashed password
   */
  async hashPassword_(password: string): Promise<string> {
    const buf = await Scrypt.kdf(password, { logN: 1, r: 1, p: 1 })
    return buf.toString("base64")
  }

  /**
   * Creates a customer from an email - customers can have accounts associated,
   * e.g. to login and view order history, etc. If a password is provided the
   * customer will automatically get an account, otherwise the customer is just
   * used to hold details of customers.
   * @param {object} customer - the customer to create
   * @return {Promise} the result of create
   */
  async create(customer: CreateCustomerInput): Promise<Customer> {
    return await this.atomicPhase_(async (manager) => {
      const customerRepository = manager.getCustomRepository(
        this.customerRepository_
      )

      customer.email = customer.email.toLowerCase()
      const { email, password } = customer

      const existing = await this.retrieveByEmail(email).catch(() => undefined)

      if (existing && existing.has_account) {
        throw new MedusaError(
          MedusaError.Types.DUPLICATE_ERROR,
          "A customer with the given email already has an account. Log in instead"
        )
      }

      if (existing && password && !existing.has_account) {
        const hashedPassword = await this.hashPassword_(password)
        customer.password_hash = hashedPassword
        customer.has_account = true
        delete customer.password

        const toUpdate = { ...existing, ...customer }
        const updated = await customerRepository.save(toUpdate)
        await this.eventBusService_
          .withTransaction(manager)
          .emit(CustomerService.Events.UPDATED, updated)
        return updated
      } else {
        if (password) {
          const hashedPassword = await this.hashPassword_(password)
          customer.password_hash = hashedPassword
          customer.has_account = true
          delete customer.password
        }

        const created = customerRepository.create(customer)
        const result = await customerRepository.save(created)
        await this.eventBusService_
          .withTransaction(manager)
          .emit(CustomerService.Events.CREATED, result)
        return result
      }
    })
  }

  /**
   * Updates a customer.
   * @param {string} customerId - the id of the variant. Must be a string that
   *   can be casted to an ObjectId
   * @param {object} update - an object with the update values.
   * @return {Promise} resolves to the update result.
   */
  async update(
    customerId: string,
    update: UpdateCustomerInput
  ): Promise<Customer> {
    return await this.atomicPhase_(
      async (manager) => {
        const customerRepository = manager.getCustomRepository(
          this.customerRepository_
        )

        const customer = await this.retrieve(customerId)

        const {
          password,
          metadata,
          billing_address,
          billing_address_id,
          groups,
          ...rest
        } = update

        if (metadata) {
          customer.metadata = setMetadata(customer, metadata)
        }

        if ("billing_address_id" in update || "billing_address" in update) {
          const address = billing_address_id || billing_address
          if (typeof address !== "undefined") {
            await this.updateBillingAddress_(customer, address)
          }
        }

        for (const [key, value] of Object.entries(rest)) {
          customer[key] = value
        }

        if (password) {
          customer.password_hash = await this.hashPassword_(password)
        }

        if (groups) {
          customer.groups = groups as CustomerGroup[]
        }

        const updated = await customerRepository.save(customer)

        await this.eventBusService_
          .withTransaction(manager)
          .emit(CustomerService.Events.UPDATED, updated)
        return updated
      },
      async (error) => {
        throw formatException(error)
      }
    )
  }

  /**
   * Updates the customers' billing address.
   * @param {Customer} customer - the Customer to update
   * @param {Object|string} addressOrId - the value to set the billing address to
   * @param {Object} addrRepo - address repository
   * @return {Promise} the result of the update operation
   */
  async updateBillingAddress_(
    customer: Customer,
    addressOrId: string | DeepPartial<Address> | undefined
  ): Promise<void> {
    return await this.atomicPhase_(async (manager) => {
      const addrRepo: AddressRepository = manager.getCustomRepository(
        this.addressRepository_
      )

      if (addressOrId === null || addressOrId === undefined) {
        customer.billing_address_id = null
        return
      }

      let address: DeepPartial<Address>
      if (typeof addressOrId === `string`) {
        const fetchedAddress = await addrRepo.findOne({
          where: { id: addressOrId },
        })

        if (!fetchedAddress) {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            `Address with id ${addressOrId} was not found`
          )
        }

        address = fetchedAddress
      } else {
        address = addressOrId
      }

      address.country_code = address.country_code?.toLowerCase()

      if (typeof address?.id !== "undefined") {
        customer.billing_address_id = address.id
      } else {
        if (customer.billing_address_id) {
          const addr = await addrRepo.findOne({
            where: { id: customer.billing_address_id },
          })

          await addrRepo.save({ ...addr, ...address })
        } else {
          const created = addrRepo.create(address)
          const saved: Address = await addrRepo.save(created)
          customer.billing_address = saved
        }
      }
    })
  }

  async updateAddress(
    customerId: string,
    addressId: string,
    address: StorePostCustomersCustomerAddressesAddressReq
  ): Promise<Address> {
    return await this.atomicPhase_(async (manager) => {
      const addressRepo = manager.getCustomRepository(this.addressRepository_)

      address.country_code = address.country_code?.toLowerCase()

      const toUpdate = await addressRepo.findOne({
        where: { id: addressId, customer_id: customerId },
      })

      if (!toUpdate) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Could not find address for customer"
        )
      }
      for (const [key, value] of Object.entries(address)) {
        toUpdate[key] = value
      }

      return addressRepo.save(toUpdate)
    })
  }

  async removeAddress(customerId: string, addressId: string): Promise<void> {
    return await this.atomicPhase_(async (manager) => {
      const addressRepo = manager.getCustomRepository(this.addressRepository_)

      // Should not fail, if user does not exist, since delete is idempotent
      const address = await addressRepo.findOne({
        where: { id: addressId, customer_id: customerId },
      })

      if (!address) {
        return
      }

      await addressRepo.softRemove(address)
    })
  }

  async addAddress(
    customerId: string,
    address: AddressCreatePayload
  ): Promise<Customer | Address> {
    return await this.atomicPhase_(async (manager) => {
      const addressRepository = manager.getCustomRepository(
        this.addressRepository_
      )

      address.country_code = address.country_code.toLowerCase()

      const customer = await this.retrieve(customerId, {
        relations: ["shipping_addresses"],
      })

      const shouldAdd = !customer.shipping_addresses.find(
        (a) =>
          a.country_code?.toLowerCase() ===
            address.country_code.toLowerCase() &&
          a.address_1 === address.address_1 &&
          a.address_2 === address.address_2 &&
          a.city === address.city &&
          a.phone === address.phone &&
          a.postal_code === address.postal_code &&
          a.province === address.province &&
          a.first_name === address.first_name &&
          a.last_name === address.last_name
      )

      if (shouldAdd) {
        const created = await addressRepository.create({
          ...address,
          customer_id: customerId,
        })
        const result = await addressRepository.save(created)
        return result
      } else {
        return customer
      }
    })
  }

  /**
   * Deletes a customer from a given customer id.
   * @param {string} customerId - the id of the customer to delete. Must be
   *   castable as an ObjectId
   * @return {Promise} the result of the delete operation.
   */
  async delete(customerId: string): Promise<Customer | void> {
    return await this.atomicPhase_(async (manager) => {
      const customerRepo = manager.getCustomRepository(this.customerRepository_)

      // Should not fail, if user does not exist, since delete is idempotent
      const customer = await customerRepo.findOne({ where: { id: customerId } })

      if (!customer) {
        return
      }

      return await customerRepo.softRemove(customer)
    })
  }
}

export default CustomerService
