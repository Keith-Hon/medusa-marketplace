import { EntityManager } from "typeorm"
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel"

export abstract class TransactionBaseService<
  TChild extends TransactionBaseService<TChild, TContainer>,
  TContainer = unknown
> {
  protected abstract manager_: EntityManager
  protected abstract transactionManager_: EntityManager | undefined

  protected constructor(
    protected readonly container: TContainer,
    protected readonly configModule?: Record<string, unknown>
  ) {}

  withTransaction(transactionManager?: EntityManager): this | TChild {
    if (!transactionManager) {
      return this
    }

    const cloned = new (<any>this.constructor)(
      {
        ...this.container,
        manager: transactionManager,
      },
      this.configModule
    )

    cloned.transactionManager_ = transactionManager

    return cloned as TChild
  }

  protected shouldRetryTransaction_(
    err: { code: string } | Record<string, unknown>
  ): boolean {
    if (!(err as { code: string })?.code) {
      return false
    }
    const code = (err as { code: string })?.code
    return code === "40001" || code === "40P01"
  }

  /**
   * Wraps some work within a transactional block. If the service already has
   * a transaction manager attached this will be reused, otherwise a new
   * transaction manager is created.
   * @param work - the transactional work to be done
   * @param isolationOrErrorHandler - the isolation level to be used for the work.
   * @param maybeErrorHandlerOrDontFail Potential error handler
   * @return the result of the transactional work
   */
  protected async atomicPhase_<TResult, TError>(
    work: (transactionManager: EntityManager) => Promise<TResult | never>,
    isolationOrErrorHandler?:
      | IsolationLevel
      | ((error: TError) => Promise<never | TResult | void>),
    maybeErrorHandlerOrDontFail?: (
      error: TError
    ) => Promise<never | TResult | void>
  ): Promise<never | TResult> {
    let errorHandler = maybeErrorHandlerOrDontFail
    let isolation:
      | IsolationLevel
      | ((error: TError) => Promise<never | TResult | void>)
      | undefined
      | null = isolationOrErrorHandler
    let dontFail = false
    if (typeof isolationOrErrorHandler === "function") {
      isolation = null
      errorHandler = isolationOrErrorHandler
      dontFail = !!maybeErrorHandlerOrDontFail
    }

    if (this.transactionManager_) {
      const doWork = async (m: EntityManager): Promise<never | TResult> => {
        this.manager_ = m
        this.transactionManager_ = m
        try {
          return await work(m)
        } catch (error) {
          if (errorHandler) {
            const queryRunner = this.transactionManager_.queryRunner
            if (queryRunner && queryRunner.isTransactionActive) {
              await queryRunner.rollbackTransaction()
            }

            await errorHandler(error)
          }
          throw error
        }
      }

      return await doWork(this.transactionManager_)
    } else {
      const temp = this.manager_
      const doWork = async (m: EntityManager): Promise<never | TResult> => {
        this.manager_ = m
        this.transactionManager_ = m
        try {
          const result = await work(m)
          this.manager_ = temp
          this.transactionManager_ = undefined
          return result
        } catch (error) {
          this.manager_ = temp
          this.transactionManager_ = undefined
          throw error
        }
      }

      if (isolation && this.manager_) {
        let result
        try {
          result = await this.manager_.transaction(
            isolation as IsolationLevel,
            (m) => doWork(m)
          )
          return result
        } catch (error) {
          if (this.shouldRetryTransaction_(error)) {
            return this.manager_.transaction(
              isolation as IsolationLevel,
              (m): Promise<never | TResult> => doWork(m)
            )
          } else {
            if (errorHandler) {
              await errorHandler(error)
            }
            throw error
          }
        }
      }

      try {
        return await this.manager_.transaction((m) => doWork(m))
      } catch (error) {
        if (errorHandler) {
          const result = await errorHandler(error)
          if (dontFail) {
            return result as TResult
          }
        }

        throw error
      }
    }
  }
}
