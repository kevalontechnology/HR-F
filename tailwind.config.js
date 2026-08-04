/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        erp: {
          primary: '#034665',      // Kevalon Primary Enterprise Navy
          primaryHover: '#023249', // Darker Hover
          secondary: '#092c3e',
          accent: '#0083B0',
          bg: '#F4F6F9',           // Classic ERP Light Gray background
          card: '#FFFFFF',
          border: '#DEE2E6',
          header: '#034665',
          text: '#212529',
          muted: '#6C757D'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
}
