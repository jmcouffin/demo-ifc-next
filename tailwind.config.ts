import type { Config } from "tailwindcss";
import type { PluginAPI } from "tailwindcss/types/config";
import plugin from "tailwindcss/plugin";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: "var(--color-accent)",
            },
            backgroundColor: {
                ground: "hsla(var(--color-bg-ground-hsl), var(--tw-bg-opacity, 1))",
                underground: "hsla(var(--color-bg-underground-hsl), var(--tw-bg-opacity, 1))",
                "underground-dark": "hsla(var(--color-bg-underground-dark-hsl), var(--tw-bg-opacity, 1))",
                overground: "hsla(var(--color-bg-overground-hsl), var(--tw-bg-opacity, 1))",
            },
            textColor: {
                primary: "var(--color-content-primary)",
                "primary-light": "var(--color-content-primary-light)",
                secondary: "var(--color-content-secondary)",
                tertiary: "var(--color-content-tertiary)",
                increase: "var(--color-energy-increase)",
                decrease: "var(--color-energy-decrease)",
            },
            borderColor: {
                primary: "var(--color-border-primary)",
                secondary: "var(--color-border-secondary)",
                tertiary: "var(--color-border-tertiary)",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            fontSize: {
                base: ["var(--font-size-md)", "var(--leading-normal)"],
                "9xl": ["var(--font-size-9xl)", "var(--leading-normal)"],
                "8xl": ["var(--font-size-8xl)", "var(--leading-normal)"],
                "7xl": ["var(--font-size-7xl)", "var(--leading-normal)"],
                "6xl": ["var(--font-size-6xl)", "var(--leading-normal)"],
                "5xl": ["var(--font-size-5xl)", "var(--leading-normal)"],
                "4xl": ["var(--font-size-4xl)", "var(--leading-normal)"],
                "3xl": ["var(--font-size-3xl)", "var(--leading-snug)"],
                "2xl": ["var(--font-size-2xl)", "var(--leading-normal)"],
                xl: ["var(--font-size-xl)", "var(--leading-normal)"],
                lg: ["var(--font-size-lg)", "var(--leading-normal)"],
                md: ["var(--font-size-md)", "var(--leading-normal)"],
                sm: ["var(--font-size-sm)", "var(--leading-normal)"],
                xs: ["var(--font-size-xs)", "var(--leading-normal)"],
                "2xs": ["var(--font-size-2xs)", "var(--leading-normal)"],
                "3xs": ["var(--font-size-3xs)", "var(--leading-normal)"],
            },
            borderRadius: {
                xs: "var(--border-radius-xs)",
                sm: "var(--border-radius-sm)",
                md: "var(--border-radius-md)",
                lg: "var(--border-radius-lg)",
                xl: "var(--border-radius-xl)",
                "2xl": "var(--border-radius-2xl)",
                "3xl": "var(--border-radius-3xl)",
            },
            screens: {
                sm: "30em",
                md: "48em",
                lg: "62em",
                xl: "80em",
                "2xl": "96em",
                "3xl": "1600px",
                "4xl": "1800px",
            },
        },
    },
    plugins: [
        plugin(
            ({ matchUtilities, theme }: { matchUtilities: PluginAPI["matchUtilities"]; theme: PluginAPI["theme"] }) => {
                matchUtilities(
                    {
                        "animation-delay": (value: string) => {
                            return {
                                "animation-delay": value,
                            };
                        },
                    },
                    {
                        values: theme("transitionDelay"),
                    },
                );
            },
        ),
    ],
};
export default config;
