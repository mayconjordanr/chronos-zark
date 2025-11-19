import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#f56f10", // ZARK Orange
          foreground: "#ffffff",
        },
        zinc: {
          950: "#09090b", // Deep Dark Mode
        },
      },
    },
  },
  plugins: [],
};
export default config;
