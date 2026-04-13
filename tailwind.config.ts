import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: "#f4f4f5", // default-100 (柔和浅灰)
            foreground: "#11181c", // default-900
          },
        },
        dark: {
          colors: {
            background: "#18181b", // default-50 (柔和深灰)
            foreground: "#ecedee", // default-900
          },
        },
      },
    }),
  ],
};

export default config;
