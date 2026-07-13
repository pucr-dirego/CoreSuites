/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tw-",
  content: [
    "./src/pages/HubPage.tsx",
    "./src/components/HubModuleCard.tsx",
    "./src/components/**/*Hub*.tsx",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        core: {
          bg: "#030b08",
          "bg-soft": "#071510",
          green: "#35d46f",
          "green-dark": "#209a4d",
          "green-muted": "#9ce8b5",
          border: "rgba(255, 255, 255, 0.08)",
          text: "#ffffff",
          muted: "rgba(255, 255, 255, 0.68)",
          "muted-soft": "rgba(255, 255, 255, 0.48)",
        },
      },
      borderRadius: {
        "core-lg": "1.375rem",
        "core-xl": "1.875rem",
        "core-2xl": "2.25rem",
      },
      boxShadow: {
        "core-card": "0 28px 90px rgba(0, 0, 0, 0.46)",
        "core-card-hover": "0 34px 100px rgba(0, 0, 0, 0.52)",
      },
    },
  },
};