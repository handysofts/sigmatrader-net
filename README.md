# React + Vite
`npm create vite@latest sigmatrader-net`

# Start
1. `npm install` , `npm install lucide-react`
2. `npm run dev`
3. http://localhost:5173

# Setup Tailwind CSS (Crucial)
Since the app uses Tailwind classes (e.g., bg-gray-900, flex, p-6), you must have Tailwind configured.
1. Install Tailwind: `npm install -D tailwindcss postcss autoprefixer` 
2. Initialize: `npx tailwindcss init -p` and check: `npm list tailwindcss`
3. In `tailwind.config.js`, ensure the content paths are set:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
4. Install postcss: `npm install -D @tailwindcss/postcss`
5. Add the Tailwind directives to your `./src/index.css`:
```css
@import "tailwindcss";
@tailwind base;
@tailwind components;
@tailwind utilities;
```