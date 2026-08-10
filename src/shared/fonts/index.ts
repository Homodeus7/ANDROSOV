import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";

const fontDisplay = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
});

const fontBody = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const fontClassName = [fontDisplay.variable, fontBody.variable, fontMono.variable].join(
  " ",
);
