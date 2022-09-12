import Scrypt from "scrypt-kdf"
import { AuthenticateResult } from "../types/auth"
import { User, Customer } from "../models"
import { TransactionBaseService } from "../interfaces"
import UserService from "./user"
import CustomerService from "./customer"
import { EntityManager } from "typeorm"

type InjectedDependencies = {
  manager: EntityManager
  userService: UserService
  customerService: CustomerService
}

/**
 * Can authenticate a user based on email password combination
 * @extends BaseService
 */
class AuthService extends TransactionBaseService<AuthService> {
  protected manager_: EntityManager
  protected transactionManager_: EntityManager | undefined
  protected readonly userService_: UserService
  protected readonly customerService_: CustomerService

  constructor({ manager, userService, customerService }: InjectedDependencies) {
    super({ manager, userService, customerService })

    this.manager_ = manager
    this.userService_ = userService
    this.customerService_ = customerService
  }

  /**
   * Verifies if a password is valid given the provided password hash
   * @param {string} password - the raw password to check
   * @param {string} hash - the hash to compare against
   * @return {bool} the result of the comparison
   */
  protected async comparePassword_(
    password: string,
    hash: string
  ): Promise<boolean> {
    const buf = Buffer.from(hash, "base64")
    return Scrypt.verify(buf, password)
  }

  /**
   * Authenticates a given user with an API token
   * @param {string} token - the api_token of the user to authenticate
   * @return {AuthenticateResult}
   *    success: whether authentication succeeded
   *    user: the user document if authentication succeded
   *    error: a string with the error message
   */
  async authenticateAPIToken(token: string): Promise<AuthenticateResult> {
    return await this.atomicPhase_(async (transactionManager) => {
      if (process.env.NODE_ENV?.startsWith("dev")) {
        try {
          const user: User = await this.userService_
            .withTransaction(transactionManager)
            .retrieve(token)
          return {
            success: true,
            user,
          }
        } catch (error) {
          // ignore
        }
      }

      try {
        const user: User = await this.userService_
          .withTransaction(transactionManager)
          .retrieveByApiToken(token)
        return {
          success: true,
          user,
        }
      } catch (error) {
        return {
          success: false,
          error: "Invalid API Token",
        }
      }
    })
  }

  /**
   * Authenticates a given user based on an email, password combination. Uses
   * scrypt to match password with hashed value.
   * @param {string} email - the email of the user
   * @param {string} password - the password of the user
   * @return {AuthenticateResult}
   *    success: whether authentication succeeded
   *    user: the user document if authentication succeded
   *    error: a string with the error message
   */
  async authenticate(
    email: string,
    password: string
  ): Promise<AuthenticateResult> {
    return await this.atomicPhase_(async (transactionManager) => {
      try {
        const userPasswordHash: User = await this.userService_
          .withTransaction(transactionManager)
          .retrieveByEmail(email, {
            select: ["password_hash"],
          })

        const passwordsMatch = await this.comparePassword_(
          password,
          userPasswordHash.password_hash
        )

        if (passwordsMatch) {
          const user = await this.userService_
            .withTransaction(transactionManager)
            .retrieveByEmail(email)

          return {
            success: true,
            user: user,
          }
        }
      } catch (error) {
        console.log("error ->", error)
        // ignore
      }

      return {
        success: false,
        error: "Invalid email or password",
      }
    })
  }

  /**
   * Authenticates a customer based on an email, password combination. Uses
   * scrypt to match password with hashed value.
   * @param {string} email - the email of the user
   * @param {string} password - the password of the user
   * @return {{ success: (bool), customer: (object | undefined) }}
   *    success: whether authentication succeeded
   *    user: the user document if authentication succeded
   *    error: a string with the error message
   */
  async authenticateCustomer(
    email: string,
    password: string
  ): Promise<AuthenticateResult> {
    return await this.atomicPhase_(async (transactionManager) => {
      try {
        const customerPasswordHash: Customer = await this.customerService_
          .withTransaction(transactionManager)
          .retrieveByEmail(email, {
            select: ["password_hash"],
          })
        if (customerPasswordHash.password_hash) {
          const passwordsMatch = await this.comparePassword_(
            password,
            customerPasswordHash.password_hash
          )

          if (passwordsMatch) {
            const customer = await this.customerService_
              .withTransaction(transactionManager)
              .retrieveByEmail(email)

            return {
              success: true,
              customer,
            }
          }
        }
      } catch (error) {
        // ignore
      }

      return {
        success: false,
        error: "Invalid email or password",
      }
    })
  }
}

export default AuthService
