/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                'primary-dark': 'var(--color-primary-dark)',
                'primary-light': 'var(--color-primary-light)',
                secondary: 'var(--color-secondary)',
                accent: 'var(--color-accent)',
            },
            fontFamily: {
                heading: ['Playfair Display', 'serif'],
                body: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
    darkMode: 'class', // Enable dark mode via class strategy
}
