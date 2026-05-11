# 01 - Technical Stack & Libraries

This document details every library and framework used in the ERP Builder project, answering the "what did you use for X and why?" questions.

## Core Framework
- **Framework:** Next.js 16.2.3 (App Router)
- **UI Library:** React 19.2.4
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4) with CSS variables for dynamic theming.

> **Simplified Explanation:**
> Imagine building a house. **React** is the bricks, **Tailwind** is the paint and decoration, **TypeScript** is the blueprint that stops you from making mistakes, and **Next.js** is the foundation and plumbing that holds everything together and connects it to the city (the internet).

## Database & ORM
- **Database:** PostgreSQL (specifically Neon Serverless Postgres)
- **ORM:** Prisma (`@prisma/client`, `prisma` v6.4.1)
- **Adapter:** `@prisma/adapter-neon` for Edge/Serverless compatibility.

> **Simplified Explanation:**
> **PostgreSQL** is a giant, super-organized filing cabinet. **Prisma** is a smart assistant who knows exactly which drawer to open. You just tell Prisma "Get me John's file", and Prisma does the hard work of searching the cabinet instead of you learning cabinet-searching language (SQL).

## UI Components & Aesthetics
- **Component Library:** shadcn/ui (customized, built on top of Radix UI primitives/`@base-ui/react`).
- **Icons:** `lucide-react` and `react-icons`.
- **Class Merging:** `clsx` and `tailwind-merge` to handle dynamic tailwind class conflicts.
- **Theming:** `next-themes` for Dark/Light/System mode switching.

> **Simplified Explanation:**
> Instead of building buttons and menus from scratch every time, **shadcn/ui** gives us pre-made Lego pieces. We just change their color and put them where we want. **Next-themes** is like a light switch that instantly turns the room from bright (Light mode) to dark (Dark mode).

## Advanced Visuals & Animations
- **3D Interactive Elements:** `@splinetool/react-spline` and `@splinetool/runtime`.
  - *Examiner Question:* "What library was used to create the 3D card on the landing page?"
  - *Answer:* "We used Spline (`@splinetool/react-spline`). It allows us to embed a fully interactive 3D WebGL scene directly into a React component without writing raw Three.js code."
- **Animations:** `framer-motion`, `gsap`, `tw-animate-css`.

> **Simplified Explanation:**
> **Spline** is like embedding a mini 3D video game right into the webpage. **Framer Motion** and **GSAP** are the puppeteers that make the website elements dance smoothly instead of just teleporting around abruptly.

## Page Composer & Drag-and-Drop
- **Drag & Drop Engine:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
  - *Examiner Question:* "Which library did you use for the drag-and-drop functionality in the Page Composer?"
  - *Answer:* "We used `dnd-kit`. Unlike older libraries like `react-beautiful-dnd`, `dnd-kit` is lightweight, highly modular, accessible, and works flawlessly with React's modern architecture and custom grid layouts."
- **Rich Text Editing:** `react-quill-new`

> **Simplified Explanation:**
> **dnd-kit** is the magic invisible hand that lets you pick up an element on the screen with your mouse, move it around, and tells the other elements to politely move out of the way to make room.

## State Management & Data Fetching
- **Global State:** `zustand` (Used for managing complex client-side state).
- **Data Fetching:** `swr` (Stale-While-Revalidate by Vercel).

> **Simplified Explanation:**
> **Zustand** is like the brain of the app that remembers things across different screens (like what you are dragging). **SWR** is like a smart messenger boy who shows you a photo of the data immediately (stale), while quietly running to the database to check if the data changed (revalidate), and updates the photo if needed.

## Authentication & Security
- **Platform Auth:** `next-auth` (for Google SSO and Admin access).
- **Tenant Auth:** Custom JWT implementation using `jose` and `bcryptjs`.

> **Simplified Explanation:**
> **next-auth** is the bouncer at the front door of the main building. **jose** creates a secret VIP wristband (JWT) that gets checked by a second bouncer (Middleware) before letting employees into their specific company rooms.

## Exporting & Data Generation
- **PDF Generation:** `jspdf` and `jspdf-autotable`.
- **Printing:** `react-to-print`.
- **QR Codes:** `qrcode`.

> **Simplified Explanation:**
> These libraries take the messy computer code and draw it neatly onto a virtual piece of paper (PDF) or convert links into black-and-white square puzzles (QR code) that phones can scan.

## Design Decisions & FAQ

*Examiner Question:* "Why did you choose Next.js App Router instead of a standard React SPA?"
*Answer:* "We chose Next.js App Router because it provides Server Components and built-in API routes. For an ERP, securely fetching database schema at the server level before sending it to the client drastically improves performance and security compared to a standard SPA making multiple round-trip API calls."

*Examiner Question:* "Why did you use Zustand over Redux?"
*Answer:* "Redux introduces too much boilerplate. Zustand is a minimalist, unopinionated state manager that handles our complex Page Composer state perfectly without the massive setup and verbosity of Redux."

*Examiner Question:* "Why Tailwind CSS instead of styled-components or SCSS?"
*Answer:* "Tailwind provides utility-first classes which drastically speeds up development. It also automatically removes unused CSS in production, leading to a much smaller bundle size and faster load times compared to traditional SCSS."

*Examiner Question:* "Why use TypeScript instead of plain JavaScript?"
*Answer:* "An ERP system handles complex, interrelated data (like nested JSON objects for dynamic records). TypeScript catches type mismatches at compile time, preventing runtime crashes and making large-scale refactoring much safer."