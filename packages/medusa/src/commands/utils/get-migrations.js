import glob from "glob"
import path from "path"
import fs from "fs"
import { isString } from "lodash"
import { sync as existsSync } from "fs-exists-cached"
import { getConfigFile, createRequireFromPath } from "medusa-core-utils"

function createFileContentHash(path, files) {
  return path + files
}

// TODO: Create unique id for each plugin
function createPluginId(name) {
  return name
}

/**
 * Finds the correct path for the plugin. If it is a local plugin it will be
 * found in the plugins folder. Otherwise we will look for the plugin in the
 * installed npm packages.
 * @param {string} pluginName - the name of the plugin to find. Should match
 *    the name of the folder where the plugin is contained.
 * @return {object} the plugin details
 */
function resolvePlugin(pluginName) {
  // Only find plugins when we're not given an absolute path
  if (!existsSync(pluginName)) {
    // Find the plugin in the local plugins folder
    const resolvedPath = path.resolve(`./plugins/${pluginName}`)

    if (existsSync(resolvedPath)) {
      if (existsSync(`${resolvedPath}/package.json`)) {
        const packageJSON = JSON.parse(
          fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
        )
        const name = packageJSON.name || pluginName
        // warnOnIncompatiblePeerDependency(name, packageJSON)

        return {
          resolve: resolvedPath,
          name,
          id: createPluginId(name),
          options: {},
          version:
            packageJSON.version || createFileContentHash(resolvedPath, `**`),
        }
      } else {
        // Make package.json a requirement for local plugins too
        throw new Error(`Plugin ${pluginName} requires a package.json file`)
      }
    }
  }

  const rootDir = path.resolve(".")

  /**
   *  Here we have an absolute path to an internal plugin, or a name of a module
   *  which should be located in node_modules.
   */
  try {
    const requireSource =
      rootDir !== null
        ? createRequireFromPath(`${rootDir}/:internal:`)
        : require

    // If the path is absolute, resolve the directory of the internal plugin,
    // otherwise resolve the directory containing the package.json
    const resolvedPath = path.dirname(
      requireSource.resolve(`${pluginName}/package.json`)
    )

    const packageJSON = JSON.parse(
      fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
    )
    // warnOnIncompatiblePeerDependency(packageJSON.name, packageJSON)

    return {
      resolve: resolvedPath,
      id: createPluginId(packageJSON.name),
      name: packageJSON.name,
      version: packageJSON.version,
    }
  } catch (err) {
    throw new Error(
      `Unable to find plugin "${pluginName}". Perhaps you need to install its package?`
    )
  }
}

export default async (directory, featureFlagRouter) => {
  const { configModule } = getConfigFile(directory, `medusa-config`)
  const { plugins } = configModule

  const resolved = plugins.map((plugin) => {
    if (isString(plugin)) {
      return resolvePlugin(plugin)
    }

    const details = resolvePlugin(plugin.resolve)
    details.options = plugin.options

    return details
  })

  resolved.push({
    resolve: `${directory}/dist`,
    name: `project-plugin`,
    id: createPluginId(`project-plugin`),
    options: {},
    version: createFileContentHash(process.cwd(), `**`),
  })

  const migrationDirs = []
  const coreMigrations = path.resolve(
    path.join(__dirname, "..", "..", "migrations")
  )

  migrationDirs.push(path.join(coreMigrations, "*.js"))

  for (const p of resolved) {
    const exists = existsSync(`${p.resolve}/migrations`)
    if (exists) {
      migrationDirs.push(`${p.resolve}/migrations/*.js`)
    }
  }

  return getEnabledMigrations(migrationDirs, (flag) =>
    featureFlagRouter.isFeatureEnabled(flag)
  )
}

export const getEnabledMigrations = (migrationDirs, isFlagEnabled) => {
  const allMigrations = migrationDirs.flatMap((dir) => {
    return glob.sync(dir)
  })
  return allMigrations
    .map((file) => {
      const loaded = require(file)
      if (
        typeof loaded.featureFlag === "undefined" ||
        isFlagEnabled(loaded.featureFlag)
      ) {
        return file
      }

      return false
    })
    .filter(Boolean)
}
