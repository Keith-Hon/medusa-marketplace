const { withStoreConfig } = require("./store-config");
const store = require("./store.config.json");
const withNx = require("@nrwl/next/plugins/with-nx");
const path = require("path");

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
    nx: {
        // Set this to true if you would like to to use SVGR
        // See: https://github.com/gregberge/svgr
        svgr: false
    },
    experimental: {
        outputStandalone: true,
        outputFileTracingRoot: path.join(__dirname, "../..")
    },
    features: store.features,
    images: {
        domains: ["medusa-public-images.s3.eu-west-1.amazonaws.com", "localhost"]
    }
};

module.exports = withStoreConfig(withNx(nextConfig));
