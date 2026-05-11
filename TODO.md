# ERP Builder — Improvement Tasks

Tracking file for all fixes/improvements. Mark items as `[x]` when done with a brief note on the fix.

**Status:** 30 / 31 shipped ✅

---

## 🔴 Critical

*(All critical tasks completed)*

## 🟡 High

- [ ] **Breaking down of Page Composer** — The `src/app/(dashboard)/pages/[pageId]/edit/page.tsx` file is ~1500 lines long, tightly coupling drag-and-drop, state, and UI. Refactor this monolith using `Zustand` to manage the composer state and split it into smaller components (`Canvas`, `Sidebar`, `useComposerStore`).

## 🟢 Medium

*(All medium tasks completed)*

## 🟢 Low

*(All low tasks completed)*
