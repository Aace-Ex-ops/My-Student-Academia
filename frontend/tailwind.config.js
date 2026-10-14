/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        palette: {
          bg: '#FAF3E1',       // Soft Cream Background
          surface: '#F5E7C6',  // Champagne / Sand Surface
          accent: '#FF6D1F',   // Electric Orange Primary Accent
          dark: '#222222',     // Rich Charcoal Dark Text
        }
      }
    },
  },
  plugins: [],
}
