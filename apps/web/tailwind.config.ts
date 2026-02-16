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
        jira: {
          blue: "#0052cc",
          darkBlue: "#0747a6",
          gray: "#f4f5f7",
          text: "#172b4d",
          subtleText: "#5e6c84",
          border: "#dfe1e6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
