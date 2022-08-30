const path = require("path")

const tailwindcssPath = path.resolve(__dirname, "tailwind.config.js")

module.exports = {
  plugins: {
    tailwindcss: { config: tailwindcssPath },
  },
}
