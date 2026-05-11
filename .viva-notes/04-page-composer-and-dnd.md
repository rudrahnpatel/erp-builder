# 04 - Page Composer & Drag and Drop

This document explains the architecture of the custom Page Composer, which allows users to build dashboards dynamically using a drag-and-drop interface.

## Core Drag-and-Drop Library

- **Library Used:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

> 👶 **ELI5 (Explain Like I'm 5):**
> Think of building a webpage like arranging magnets on a fridge. `dnd-kit` is the invisible rulebook that tells the magnets how to move smoothly and snap into the right places without falling off or overlapping weirdly.

*Examiner Question:* "What component/library was used for dragging and dropping components in the page composer?"
*Answer:* "We used `dnd-kit`. It provides primitives like `<DndContext>`, `useDraggable`, and `useDroppable`. Unlike older libraries, it separates the DOM event handling from the visual layout, which allowed us to build a complex multi-column CSS grid where items can be resized and sorted simultaneously."

## Architecture of the Composer

The composer relies on an array of `PlacedBlock` objects stored in React state (and eventually saved to the `Page.blocks` JSON column in the database).

```typescript
interface PlacedBlock {
  id: string;        // Unique ID for the instance on the canvas
  type: string;      // "TABLE_VIEW", "CHART", "METRIC", etc.
  label: string;
  icon: ReactNode;
  config?: any;      // Custom settings for the block (e.g. which table to link to)
}
```

> **Simplified Explanation:**
> The website remembers your design simply as a grocery list. "Item 1 is a chart, Item 2 is a table." The `config` part is just the instructions for each item: "Make the chart blue" or "Show data from the Customers table."

### The Three Panes
The UI is divided into three sections:
1. **Left Sidebar (Palette):** Contains draggable items (`palette-item`). When dragged onto the canvas, a new `PlacedBlock` is generated.
2. **Center Canvas (Dropzone & Sortable Context):** Uses CSS Grid (`grid-cols-6`). The canvas itself is a droppable area. Inside it, a `<SortableContext>` wraps all the placed blocks, allowing them to be reordered using `arrayMove`.
3. **Right Sidebar (Properties Inspector):** When a block on the canvas is clicked, it becomes the "selected" block. The right sidebar reads its `config` object and renders relevant inputs (e.g., dropdowns to pick a table, color pickers, text inputs).

## CSS Grid and Resizing

The canvas relies on a 6-column CSS grid.
```css
grid-template-columns: repeat(6, minmax(0, 1fr));
```

Each block's `config` has a `colSpan` (1 to 6).
When a user drags the right-edge resizer of a block, a `PointerEvent` triggers a calculation:
`newColSpan = startColSpan + Math.round(dragDeltaX / columnWidth)`.
The block's `gridColumn` inline style is then updated (`grid-column: span {colSpan} / span {colSpan}`).

> **Simplified Explanation:**
> The page is divided into 6 vertical invisible lanes. A small box takes up 2 lanes (`span 2`), a full-width box takes up all 6 lanes (`span 6`). When you drag to resize, the computer just calculates how many lanes your mouse crossed and updates the number.

## Block Rendering Engine

At runtime (in the actual app view, not the editor), the page iterates over the `blocks` array and uses a `switch` statement to render the correct React component dynamically.

```tsx
// Simplified example of the runtime rendering engine
{blocks.map(block => {
  switch(block.type) {
    case "TABLE_VIEW": return <TableView config={block.config} />;
    case "METRIC": return <MetricCard config={block.config} />;
    case "CHART": return <ChartView config={block.config} />;
    // ...
  }
})}
```

> **Simplified Explanation:**
> The engine is like a factory line. It reads the grocery list. If the list says "METRIC", it pulls a metric card from the shelf, paints it according to the config instructions, and puts it on the screen.

This decoupled design means that adding a new widget to the ERP simply involves adding a new case to the switch statement and defining its properties in the palette.

## Design Decisions & FAQ

*Examiner Question:* "Why did you choose `dnd-kit` over `react-beautiful-dnd`?"
*Answer:* "`react-beautiful-dnd` is deprecated and struggles heavily with 2-dimensional CSS Grid layouts. `dnd-kit` is modern, actively maintained, and separates the drag logic from the visual DOM, allowing us to perfectly snap items into our complex 6-column grid."

*Examiner Question:* "Why store the Page layout as JSON in the database?"
*Answer:* "It provides immense flexibility. If we invent a new block type tomorrow (like a Kanban board), we don't need to change the database schema. We just parse the JSON and our React frontend knows how to render the new type."

*Examiner Question:* "How do you ensure the drag-and-drop dashboards look good on mobile phones?"
*Answer:* "Our CSS Grid system is responsive by default. While a chart might take up `span 4` out of 6 columns on a desktop, we use Tailwind's responsive prefixes (like `col-span-full md:col-span-4`) in the rendering engine to ensure that on small mobile screens, all blocks automatically stack vertically to take up the full screen width."