/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "secondary-dim": "#5341ad",
        "on-secondary-container": "#5240ab",
        "secondary": "#00666b", // from recruiter panel
        "outline-variant": "#aeb3b6",
        "on-surface-variant": "#5a6063",
        "surface-variant": "#dee3e7",
        "inverse-surface": "#0c0f10",
        "primary-dim": "#0048b5",
        "outline": "#767b7f",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e0e3e5",
        "tertiary-container": "#ff82f4",
        "surface": "#f5f6f8",
        "on-secondary": "#cafcff",
        "on-error-container": "#65000b",
        "on-tertiary": "#ffeef8",
        "secondary-container": "#71eff7",
        "on-background": "#2c2f31",
        "tertiary": "#9e1e9b",
        "tertiary-fixed": "#ff82f4",
        "error-dim": "#70030f",
        "surface-dim": "#d1d5d8",
        "error": "#b31b25",
        "inverse-primary": "#5c8bff",
        "surface-container-low": "#eff1f3",
        "surface-tint": "#0253cd",
        "surface-container-highest": "#dadde0",
        "on-primary": "#f1f2ff",
        "surface-container": "#e6e8eb",
        "error-container": "#fb5151",
        "on-error": "#ffefee",
        "primary-container": "#789dff",
        "surface-bright": "#f5f6f8",
        "on-surface": "#2c2f31",
        "primary": "#0253cd",
        "background": "#f5f6f8",
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
