/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border, 0 0% 20%))",
        input: "hsl(var(--input, 0 0% 20%))",
        ring: "hsl(var(--ring, 340 75% 55%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 0 0% 10%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 340 75% 55%))",
          foreground: "hsl(var(--primary-foreground, 0 0% 100%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 240 5% 96%))",
          foreground: "hsl(var(--secondary-foreground, 240 6% 10%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 84% 60%))",
          foreground: "hsl(var(--destructive-foreground, 0 0% 98%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 240 5% 96%))",
          foreground: "hsl(var(--muted-foreground, 240 4% 46%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 240 5% 96%))",
          foreground: "hsl(var(--accent-foreground, 240 6% 10%))",
        },
        card: {
          DEFAULT: "hsl(var(--card, 0 0% 100%))",
          foreground: "hsl(var(--card-foreground, 0 0% 10%))",
        },
      },
      borderRadius: {
        lg: "var(--radius, 0.5rem)",
        md: "calc(var(--radius, 0.5rem) - 2px)",
        sm: "calc(var(--radius, 0.5rem) - 4px)",
      },
    },
  },
  corePlugins: {
    // Disable preflight base reset so it doesn't overwrite Velvet Hearts custom fonts, buttons, or inputs
    preflight: false,
  },
  plugins: [],
}
