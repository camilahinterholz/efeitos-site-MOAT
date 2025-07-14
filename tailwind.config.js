/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'moat': {
                    'azul': '#0C8BD2',
                    'verde': '#2DD6A3',
                    'amarelo': '#E7DC52',
                    'amarelo-claro': '#F7EC63',
                }
            },
            backgroundImage: {
                'gradient-moat': 'linear-gradient(to right, #0C8BD2, #2DD6A3, #E7DC52, #F7EC63)',
            }
        },
    },
    plugins: [],
}