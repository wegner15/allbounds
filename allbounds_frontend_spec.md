# allbounds — Frontend Design Specification (React + Vite + TS + Tailwind)

> **Version:** v1.0  
> **Date:** 2025-09-12  
> **Owner:** Web Platform  
> **Scope:** Public web app for a tour company (Destinations, Packages, Group Trips, Accommodations, Attractions, Activities, Holiday Types, Blog) with a lightweight Admin shell (v1: content preview & media manager only).  
> **Branding:** Use *Allbound Vacations – Branding Guide* colors throughout.  
> **Typography:** Emulate the TUI BLUE offers site font treatment (Playfair Display + Lato).

---

## 1) Objectives & Non-Goals

**Objectives**
- Deliver a fast, accessible, SEO-ready, responsive site.
- Provide a component system locked to brand guide.
- Integrate with backend APIs and Meilisearch search.

**Non-Goals**
- Payments/checkout in v1.
- Full CMS in frontend.

---

## 2) Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS (strict design tokens)
- React Router v6
- TanStack Query, Zustand (UI state)
- React Hook Form + Zod
- react-helmet-async for SEO
- Vitest + RTL + Playwright

---

## 3) Information Architecture

### Public Routes
- /regions, /regions/:slug
- /countries, /countries/:slug
- /packages, /packages/:slug
- /group-trips, /group-trips/:slug
- /stays, /stays/:slug
- /activities, /activities/:slug
- /attractions/:slug
- /holiday-types, /holiday-types/:slug
- /blog, /blog/:slug
- /search

### Admin (light)
- /admin/preview/:type/:id
- /admin/media

---

## 4) Project Structure

/src  
  /app  
  /features (countries, packages, trips, etc.)  
  /components (ui, data, layout, composite)  
  /lib  
  /styles  
  /assets  
  /config  
  /test  

---

## 5) Design System

### Colors (from Branding Guide)
- Charcoal: #3c4852  
- Paper: #ecebdd  
- Butter: #eeca80  
- Sand: #edd785  
- Teal: #8cb9bf  
- Mint: #58e5b1  
- Footer: #bab7ac  
- Primary link: #3c4852  
- Hover: #b54359  

### Typography
- Headings: Playfair Display (serif)  
- Body/UI: Lato (sans-serif)  
- Scale: H1 40–56px, H2 32–44px, Body 16–18px.

---

## 6) Components

- UI: Button, Input, Select, Badge, Rating, Tabs, Dialog.  
- Data: Cards, Media, ReviewList, Gallery.  
- Layout: Header, Footer, Nav, Breadcrumb.  
- Composite: FiltersPanel, SearchCombobox, Itinerary, ReviewForm.

---

## 7) Pages & UX

- Country: hero, stats, packages, activities.  
- Packages: filters, detail with itinerary & reviews.  
- Group Trips: departures, reviews.  
- Stays: amenities, stars.  
- Blog: tags, related posts.  
- Holiday Types: curated experiences.  
- Global Search: unified results.

---

## 8) API & State

- API client with fetch + TanStack Query.  
- Types shared with backend DTOs.  
- Filters sync with URL params.

---

## 9) Performance & Accessibility

- Lazy images, skeletons, responsive `srcSet`.  
- CLS <0.1, LCP <2.5s.  
- WCAG AA color contrast.  
- Keyboard nav, ARIA roles, skip-link.

---

## 10) SEO & Social

- Titles, meta, JSON-LD (breadcrumbs, product, article).  
- Canonical URLs.  
- Sitemap from backend.

---

## 11) Forms

- Review form with validation, honeypot, moderation notice.  
- Enquiry/contact form with contextual product link.

---

## 12) Checklist

- [ ] Tailwind theme with brand tokens  
- [ ] Global typography aligned to Playfair + Lato  
- [ ] Header/Nav + search combobox  
- [ ] Packages/Trips/Stays pages  
- [ ] Blog & Holiday Types pages  
- [ ] Accessibility & performance budgets  
- [ ] Analytics & CI pipeline  

---
Email: admin@allbounds.com
Password: Admin123!