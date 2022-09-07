const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
    case "production":
        ENV_FILE_NAME = ".env.production";
        break;
    case "staging":
        ENV_FILE_NAME = ".env.staging";
        break;
    case "test":
        ENV_FILE_NAME = ".env.test";
        break;
    case "development":
    default:
        ENV_FILE_NAME = ".env";
        break;
}

try {
    dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {
    throw new Error(`error: unable to locale .env file: ${e}`);
}

// CORS when consuming Medusa from admin
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

// Database URL (here we use a local database called medusa-development)
const DATABASE_URL = process.env.DATABASE_URL;

// Medusa uses Redis, so this needs configuration as well
const REDIS_URL = process.env.REDIS_URL;

// Stripe keys
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const plugins = [
    `medusa-fulfillment-manual`,
    `medusa-payment-manual`,
    {
        resolve: `medusa-payment-stripe`,
        options: {
            api_key: STRIPE_API_KEY,
            webhook_secret: STRIPE_WEBHOOK_SECRET
        }
    }
];

module.exports = {
    projectConfig: {
        redis_url: REDIS_URL,
        database_url: DATABASE_URL,
        database_type: "postgres",
        store_cors: STORE_CORS,
        admin_cors: ADMIN_CORS,
        database_extra: { ssl: false },
        cli_migration_dirs: ["dist/**/*.migration.js"]
    },
    plugins
};
