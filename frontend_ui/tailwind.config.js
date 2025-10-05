// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Space Palette
        'space-dark': '#0C0F1A',          // Main background, deep navy/black
        'space-card': '#1A1E2C',          // Background for major cards/sections
        'space-light': '#2A3042',         // Lighter elements, inputs, subtle borders
        'space-border': '#3B435C',        // Distinct border color
        'text-light': '#E5E7EB',          // Primary light text (almost white)
        'text-muted': '#9CA3AF',          // Muted gray for descriptions
        'accent-teal': '#00C9A7',         // Bright, energetic accent color (teal/cyan)
        'accent-blue-light': '#38BDF8',   // Secondary bright blue accent
        'accent-blue-dark': '#1E3A8A',    // Darker blue, for depth in gradients
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'], // A cool space-themed font for stats/code
      },
      // Optional: Custom shadows for depth
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};