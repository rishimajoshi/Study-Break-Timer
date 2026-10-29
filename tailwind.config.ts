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
        brand: {
          blue: "#2878E8",
          "blue-hover": "#1f67cb",
          "blue-soft": "#EAF2FD",
          navy: "#14213D",
          muted: "#718096",
          border: "#D7DDE7",
          bg: "#F8FAFC",
          card: "#FFFFFF",
          teal: "#0D9488",
          "teal-soft": "#E6F6F4",
          amber: "#D97706",
          "amber-soft": "#FEF3C7",
          rose: "#E11D48",
          "rose-soft": "#FFE4E6",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "sans-serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        card: "0 4px 6px -1px rgba(20, 33, 61, 0.05), 0 2px 4px -2px rgba(20, 33, 61, 0.03)",
        focus: "0 0 0 3px rgba(40, 120, 232, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
