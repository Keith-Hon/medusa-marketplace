import { Return } from "./../../../../models/return"
import { Router } from "express"
import middlewares from "../../../middlewares"

const route = Router()

export default (app) => {
  app.use("/returns", route)

  route.post("/", middlewares.wrap(require("./create-return").default))

  return app
}

export type StoreReturnsRes = {
  return: Return
}

export * from "./create-return"
