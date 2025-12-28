/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // We map your Hex codes to logical names here
      colors: {
        primary: '#005F73',      // Deep Teal (Brand)
        success: '#0A9396',      // Vital Green (Safe)
        warning: '#EE9B00',      // Amber (Attention)
        danger: '#AE2012',       // Crimson Red (Critical)
        
        // Backgrounds
        background: '#F8F9FA',   // Off-White (Main App BG)
        surface: '#FFFFFF',      // Pure White (Cards/Tables)
        
        // Text
        textMain: '#212529',     // Dark Charcoal (Headings)
        textMuted: '#6C757D',    // Slate Gray (Labels)
        border: '#E9ECEF',       // Light Gray (Dividers)
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Your new font
      }
    },
  },
  plugins: [],
}