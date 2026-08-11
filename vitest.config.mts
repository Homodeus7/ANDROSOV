import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
      // Подпуть, который умеет разрешать только сборщик Next: без этого падает
      // любой тест, чей импорт доходит до навигации next-intl
      { find: /^next\/navigation$/, replacement: "next/navigation.js" },
    ],
  },
  test: {
    // Иначе `next-intl` грузится Node напрямую, мимо алиасов
    server: { deps: { inline: ["next-intl"] } },
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
  },
});
