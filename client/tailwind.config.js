/** @type {import('tailwindcss').Config} */
// NOTE: This is the minimal scaffold config. The full design-system token
// mapping (colors, radii, shadows from .claude/skills/design-system) lands in
// Milestone 5.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
