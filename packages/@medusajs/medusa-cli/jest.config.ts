/* eslint-disable */
export default {
    displayName: "@medusajs-medusa-cli",
    preset: "../../../jest.preset.js",
    globals: {
        "ts-jest": {
            tsconfig: "<rootDir>/tsconfig.spec.json"
        }
    },
    testEnvironment: "node",
    transform: {
        "^.+\\.[tj]sx?$": "ts-jest"
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    coverageDirectory: "../../../coverage/packages/@medusajs/medusa-cli"
};
