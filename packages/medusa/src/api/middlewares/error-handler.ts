import { NextFunction, Request, Response } from "express"
import { MedusaError } from "medusa-core-utils"
import { Logger } from "../../types/global"

const QUERY_RUNNER_RELEASED = "QueryRunnerAlreadyReleasedError"
const TRANSACTION_STARTED = "TransactionAlreadyStartedError"
const TRANSACTION_NOT_STARTED = "TransactionNotStartedError"

const API_ERROR = "api_error"
const INVALID_REQUEST_ERROR = "invalid_request_error"
const INVALID_STATE_ERROR = "invalid_state_error"

export default () => {
  return (
    err: MedusaError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const logger: Logger = req.scope.resolve("logger")
    logger.error(err)

    const errorType = err.type || err.name

    const errObj = {
      code: err.code,
      type: err.type,
      message: err.message,
    }

    let statusCode = 500
    switch (errorType) {
      case QUERY_RUNNER_RELEASED:
      case TRANSACTION_STARTED:
      case TRANSACTION_NOT_STARTED:
        statusCode = 409
        errObj.code = INVALID_STATE_ERROR
        errObj.message =
          "The request conflicted with another request. You may retry the request with the provided Idempotency-Key."
        break
      case MedusaError.Types.DUPLICATE_ERROR:
        statusCode = 422
        errObj.code = INVALID_REQUEST_ERROR
        break
      case MedusaError.Types.NOT_ALLOWED:
      case MedusaError.Types.INVALID_DATA:
        statusCode = 400
        break
      case MedusaError.Types.NOT_FOUND:
        statusCode = 404
        break
      case MedusaError.Types.DB_ERROR:
        statusCode = 500
        errObj.code = API_ERROR
        break
      case MedusaError.Types.UNEXPECTED_STATE:
      case MedusaError.Types.INVALID_ARGUMENT:
        break
      default:
        errObj.code = "unknown_error"
        errObj.message = "An unknown error occurred."
        errObj.type = "unknown_error"
        break
    }

    res.status(statusCode).json(errObj)
  }
}
