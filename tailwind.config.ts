import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        muted: "#697571",
        canvas: "#f5f7f5",
        line: "#e6ebe7",
        brand: {
          DEFAULT: "#167a5a",
          dark: "#105b43",
          soft: "#e4f4ec",
        },
      },
      boxShadow: {
        panel: "0 2px 12px rgba(20, 43, 34, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
