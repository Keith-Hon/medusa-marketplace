 import { getConfigFile } from "medusa-core-utils"
import { Column, ColumnOptions, Entity, EntityOptions } from "typeorm"
import featureFlagsLoader from "../loaders/feature-flags"
import path from "path"
import { ConfigModule } from "../types/global"
import { FlagRouter } from "./flag-router"

 /**
  * If that file is required in a non node environment then the setImmediate timer does not exists.
  * This can happen when a client package require a server based package and that one of the import
  * require to import that file which is using the setImmediate.
  * In order to take care of those cases, the setImmediate timer will use the one provided by the api (node)
  * if possible and will provide a mock in a browser like environment.
  */
let setImmediate_
try {
  setImmediate_ = setImmediate
} catch (e) {
  console.warn(
    "[feature-flag-decorator.ts] setImmediate will use a mock, this happen when this file is required in a browser environment and should not impact you"
  )
  setImmediate_ = ((callback: () => void | Promise<void>) => callback())
}

export function FeatureFlagColumn(
  featureFlag: string,
  columnOptions: ColumnOptions = {}
): PropertyDecorator {
  return function (target, propertyName) {
    setImmediate_((): any => {
      const featureFlagRouter = getFeatureFlagRouter()

      if (!featureFlagRouter.isFeatureEnabled(featureFlag)) {
        return
      }

      Column(columnOptions)(target, propertyName)
    })
  }
}

export function FeatureFlagDecorators(
  featureFlag: string,
  decorators: PropertyDecorator[]
): PropertyDecorator {
  return function (target, propertyName) {
    setImmediate_((): any => {
      const featureFlagRouter = getFeatureFlagRouter()

      if (!featureFlagRouter.isFeatureEnabled(featureFlag)) {
        return
      }

      decorators.forEach((decorator: PropertyDecorator) => {
        decorator(target, propertyName)
      })
    })
  }
}

export function FeatureFlagEntity(
  featureFlag: string,
  name?: string,
  options?: EntityOptions
): ClassDecorator {
  return function (target: Function): void {
    target["isFeatureEnabled"] = function (): boolean {
      const featureFlagRouter = getFeatureFlagRouter()

      return featureFlagRouter.isFeatureEnabled(featureFlag)
    }
    Entity(name, options)(target)
  }
}

function getFeatureFlagRouter(): FlagRouter {
  const { configModule } = getConfigFile(
    path.resolve("."),
    `medusa-config`
  ) as { configModule: ConfigModule }

  return featureFlagsLoader(configModule)
}
