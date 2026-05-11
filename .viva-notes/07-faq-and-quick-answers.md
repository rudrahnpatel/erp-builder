# 07 - FAQ & Quick Answers for Examiner

Use this cheat sheet to confidently answer direct technical questions during your viva or presentation. Every answer includes a simple analogy (ELI5) to help you explain it easily.

### Q: What is the core technology stack?
**A:** The project is built using Next.js (App Router), React, TypeScript, and Tailwind CSS. The backend uses Prisma ORM connected to a Neon Serverless PostgreSQL database.
> **Simplified Explanation:** React and Tailwind build the house, Next.js is the foundation, and PostgreSQL via Prisma is our ultra-organized storage room.

### Q: How did you implement multi-tenancy? (How do you separate data for different companies?)
**A:** We use a two-layered approach. First, Next.js Middleware (`src/proxy.ts`) intercepts requests, reads the subdomain from the Host header, and rewrites the path to a dynamic tenant folder (e.g., `/apps/[slug]`). Second, at the database level, every table has a `workspaceId` foreign key, and all Prisma queries strictly filter by this ID.
> **Simplified Explanation:** Like an apartment building: Middleware is the receptionist directing you to the right floor (URL routing), and the Workspace ID is your unique key that only unlocks your room's data.

### Q: What library was used for the Drag and Drop Page Composer?
**A:** We used `dnd-kit` (`@dnd-kit/core` and `@dnd-kit/sortable`). It is a modern, lightweight, and accessible drag-and-drop toolkit that works perfectly with our CSS Grid layout, unlike older libraries that struggle with grid sorting.
> **Simplified Explanation:** It's the invisible hand that lets us pick up widgets, drag them smoothly, and mathematically calculates where they should snap into our 6-column grid.

### Q: What library was used for the 3D element on the landing page?
**A:** We used Spline (`@splinetool/react-spline`). It allows us to integrate interactive 3D WebGL scenes directly into React without having to write complex Three.js boilerplate.
> **Simplified Explanation:** It lets us embed a mini, interactive 3D video game right inside a web page block.

### Q: How do you handle authentication?
**A:** We use a dual authentication system to maintain security boundaries. Platform owners use `next-auth` (with Google SSO support), which handles database sessions. Tenant employees use a custom JWT solution built with `jose` (Edge-compatible) and `bcryptjs`. The JWT is stored in an HTTP-only cookie and verified by the Next.js Middleware.
> **Simplified Explanation:** Platform owners log in via the main gate using official IDs (NextAuth). Tenant employees log into their company portal and get a digital wristband (JWT by jose) that the hallway bouncers (Middleware) check.

### Q: How do users create tables and fields without altering the actual PostgreSQL database schema?
**A:** We use a metadata-driven "EAV" (Entity-Attribute-Value) pattern. Instead of running `CREATE TABLE` commands, we store the definition of entities in a `Table` row and their columns in `Field` rows. The actual user data is stored as a JSON object inside a single `data` column in the `Record` table.
> **Simplified Explanation:** Instead of knocking down database walls to build new ones, we put all data inside a giant box as flexible JSON documents, using sticky notes (Field rows) to remember what the data means.

### Q: If a user installs the "Inventory" module and renames a field, does it break the original module code?
**A:** No. We use an event-sourcing/override architecture. The core module definition (`registry.ts`) is never mutated. When a user renames a field, we store a `RENAME_FIELD` row in the `WorkspaceSchemaOverride` table. At runtime, our Schema Resolver merges the original definition with the user's overrides.
> **Simplified Explanation:** It's like putting a transparent sticky note over a printed book. We never erase the printed text; we just read the sticky note on top of it.

### Q: How is search implemented? Is it slow to search through all those JSON columns?
**A:** We do not scan the JSON columns during a search. We built an event-driven `GlobalSearchIndex` table. Whenever a record, page, or module is created or updated, we extract the important text and insert a flattened row into the GlobalSearchIndex. Our search API only queries this highly optimized table, making it extremely fast.
> **Simplified Explanation:** Instead of reading every book in the library to find a word, we created a small index card for every book. The search engine just quickly flips through the index cards.

### Q: How do you generate PDFs and Invoices?
**A:** We use `jspdf` and `jspdf-autotable` inside our Plugin executor engine to take the JSON data from a Record and format it into a professional, downloadable PDF.
> **Simplified Explanation:** It takes the raw computer code of a bill and neatly draws it onto a virtual piece of paper that anyone can download and read.
