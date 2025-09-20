# AllBounds Vacations Frontend

> **Version:** v1.0  
> **Date:** 2025-09-12  

A modern, responsive frontend for AllBounds Vacations - a tour company website featuring destinations, packages, group trips, accommodations, attractions, activities, holiday types, and a blog with a lightweight admin interface.

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS (with brand design tokens)
- React Router v6
- TanStack Query, Zustand (UI state)
- React Hook Form + Zod
- react-helmet-async for SEO
- Vitest + Testing Library for testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:3000.

## Project Structure

```
/src
  /app          # App-wide setup and configuration
  /features     # Feature-specific components (countries, packages, etc.)
  /components   # Reusable components
    /ui         # Basic UI components (Button, Input, etc.)
    /data       # Data display components (Cards, Media, etc.)
    /layout     # Layout components (Header, Footer, etc.)
    /composite  # Complex components (FiltersPanel, SearchCombobox, etc.)
  /lib          # Utilities, hooks, and services
  /styles       # Global styles and Tailwind configuration
  /assets       # Static assets
  /config       # Configuration files
  /test         # Test setup and utilities
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run format` - Format code with Prettier
- `npm run deploy` - Build and prepare for deployment

## Deployment

The application is configured for deployment to Netlify or similar static hosting services.

```bash
# Build and test the application
npm run deploy

# The build output will be in the /dist directory
```

## Design System

The application uses a custom design system based on the AllBounds Vacations branding guide:

### Colors
- Charcoal: #3c4852  
- Paper: #ecebdd  
- Butter: #eeca80  
- Sand: #edd785  
- Teal: #8cb9bf  
- Mint: #58e5b1  
- Footer: #bab7ac  

### Typography
- Headings: Playfair Display (serif)  
- Body/UI: Lato (sans-serif)

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
