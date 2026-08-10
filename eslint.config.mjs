import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const LAYERS = ["app", "views", "widgets", "features", "entities", "shared"];

const PUBLIC_API_GROUP = [
  "@/views/*/**",
  "@/widgets/*/**",
  "@/features/*/**",
  "@/entities/*/**",
  "@/shared/*/**",
  "!@/shared/styles/**",
];

const layerConfig = (layer, index) => {
  const above = LAYERS.slice(0, index);
  const patterns = [
    {
      group: PUBLIC_API_GROUP,
      message: "FSD: import a slice through its public API (index.ts) only.",
    },
  ];

  if (above.length > 0) {
    patterns.push({
      group: above.flatMap((upper) => [`@/${upper}`, `@/${upper}/**`]),
      message: `FSD: "${layer}" may not import from "${above.join('", "')}" — imports go downwards only.`,
    });
  }

  return {
    files: [`src/${layer}/**/*`],
    rules: { "no-restricted-imports": ["error", { patterns }] },
  };
};

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  ...LAYERS.map(layerConfig),
  {
    // Внутри островов React нет: `useFlowDemo` — composable Vue,
    // и правила хуков ловят его только по имени
    files: ["src/**/vue/**/*"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
);
