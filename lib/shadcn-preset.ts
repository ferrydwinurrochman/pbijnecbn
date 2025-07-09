import { fontFamily } from "tailwindcss/defaultTheme"
import type { Config } from "tailwindcss"

export const shadcnPreset: Config = {
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
}