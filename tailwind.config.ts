import { fontFamily } from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: ['./src/**/*.{html,svelte,js,ts}'],
    safelist: ["dark"],
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            {
                dark: {
                    "color-scheme": "dark",
                    "primary": "oklch(65.69% 0.196 275.75)",
                    "secondary": "oklch(74.8% 0.26 342.55)",
                    "accent": "oklch(74.51% 0.167 183.61)",
                    "neutral": "#202020",
                    "neutral-content": "#d4d4d4",
                    "base-100": "#292929",
                    "base-200": "#292929",
                    "base-300": "#292929",
                    "base-content": "#d4d4d4",
                },
            },
        ],
    },
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px"
            }
        },
        extend: {
            colors: {
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)"
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)"
                },
                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)"
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)"
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)"
                },
                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)"
                },
                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)"
                }
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)"
            },
            fontFamily: {
                sans: [...fontFamily.sans]
            }
        }
    },
} as Config;

export default config;
