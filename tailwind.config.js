/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./main.js",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#6366f1',
                    hover: '#4f46e5',
                },
                dark: {
                    bg: '#0f172a',
                    card: '#1e293b',
                    border: '#334155',
                }
            },
            fontFamily: {
                outfit: ['Outfit', 'sans-serif'],
            },
        },
    },
    plugins: [],
    darkMode: 'class',
}
