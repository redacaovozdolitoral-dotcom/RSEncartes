Agora vou atualizar o tailwind.config.js com as cores neon e reiniciar os serviços:
Action: file_editor view /app/frontend/tailwind.config.js
Observation: [Showing lines 1-82 of 82 total] /app/frontend/tailwind.config.js:
1|/** @type {import('tailwindcss').Config} */
2|module.exports = {
3|    darkMode: ["class"],
4|    content: [
5|    "./src/**/*.{js,jsx,ts,tsx}",
6|    "./public/index.html"
7|  ],
8|  theme: {
9|        extend: {
10|                borderRadius: {
11|                        lg: 'var(--radius)',
12|                        md: 'calc(var(--radius) - 2px)',
13|                        sm: 'calc(var(--radius) - 4px)'
14|                },
15|                colors: {
16|                        background: 'hsl(var(--background))',
17|                        foreground: 'hsl(var(--foreground))',
18|                        card: {
19|                                DEFAULT: 'hsl(var(--card))',
20|                                foreground: 'hsl(var(--card-foreground))'
21|                        },
22|                        popover: {
23|                                DEFAULT: 'hsl(var(--popover))',
24|                                foreground: 'hsl(var(--popover-foreground))'
25|                        },
26|                        primary: {
27|                                DEFAULT: 'hsl(var(--primary))',
28|                                foreground: 'hsl(var(--primary-foreground))'
29|                        },
30|                        secondary: {
31|                                DEFAULT: 'hsl(var(--secondary))',
32|                                foreground: 'hsl(var(--secondary-foreground))'
33|                        },
34|                        muted: {
35|                                DEFAULT: 'hsl(var(--muted))',
36|                                foreground: 'hsl(var(--muted-foreground))'
37|                        },
38|                        accent: {
39|                                DEFAULT: 'hsl(var(--accent))',
40|                                foreground: 'hsl(var(--accent-foreground))'
41|                        },
42|                        destructive: {
43|                                DEFAULT: 'hsl(var(--destructive))',
44|                                foreground: 'hsl(var(--destructive-foreground))'
45|                        },
46|                        border: 'hsl(var(--border))',
47|                        input: 'hsl(var(--input))',
48|                        ring: 'hsl(var(--ring))',
49|                        chart: {
50|                                '1': 'hsl(var(--chart-1))',
51|                                '2': 'hsl(var(--chart-2))',
52|                                '3': 'hsl(var(--chart-3))',
53|                                '4': 'hsl(var(--chart-4))',
54|                                '5': 'hsl(var(--chart-5))'
55|                        }
56|                },
57|                keyframes: {
58|                        'accordion-down': {
59|                                from: {
60|                                        height: '0'
61|                                },
62|                                to: {
63|                                        height: 'var(--radix-accordion-content-height)'
64|                                }
65|                        },
66|                        'accordion-up': {
67|                                from: {
68|                                        height: 'var(--radix-accordion-content-height)'
69|                                },
70|                                to: {
71|                                        height: '0'
72|                                }
73|                        }
74|                },
75|                animation: {
76|                        'accordion-down': 'accordion-down 0.2s ease-out',
77|                        'accordion-up': 'accordion-up 0.2s ease-out'
78|                }
79|        }
80|  },
81|  plugins: [require("tailwindcss-animate")],
82|};
[End of file]
