import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    dedupe: [
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/private-theming",
      "@mui/system",
      "react",
      "react-dom",
    ],
    tsconfigPaths: true,
  },
});
