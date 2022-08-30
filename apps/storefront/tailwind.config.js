const path = require("path");

module.exports = {
    content: [
        path.resolve(__dirname, "./pages/**/*.{js,ts,jsx,tsx}"),
        path.resolve(__dirname, "./components/**/*.{js,ts,jsx,tsx}"),
        path.resolve(__dirname, "./modules/**/*.{js,ts,jsx,tsx}")
    ],
    theme: {
        extend: {
            transitionProperty: {
                width: "width",
                spacing: "margin, padding"
            },
            maxWidth: {
                "8xl": "100rem"
            },
            screens: {
                "2xsmall": "320px",
                xsmall: "512px",
                small: "1024px",
                medium: "1280px",
                large: "1440px",
                xlarge: "1680px",
                "2xlarge": "1920px"
            },
            fontFamily: {
                sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Ubuntu", "sans-serif"]
            }
        }
    },
    plugins: []
};
