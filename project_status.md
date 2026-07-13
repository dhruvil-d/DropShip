# Project Status: Visual Builder (DropShip)

This document outlines the features and components that have been developed so far, as well as the planned roadmap for future development.

## Things Made Up Till Now

### Frontend (React + Vite + Craft.js)
- **Visual Editor Interface:** A drag-and-drop page builder layout with a central canvas (`App.tsx`).
- **Dynamic Component Registry:** A centralized registry (`component-registry.ts`) that manages all components, their props, and configurations dynamically instead of relying on hardcoded arrays.
- **Editor Components:**
  - `Topbar`: Navigation and high-level actions (like previewing/exporting).
  - `Toolbox`: A registry-driven left sidebar with searchable, categorized palettes of draggable components.
  - `SettingsPanel`: Right sidebar for editing properties of the currently selected component.
  - `PreviewModal`: A modal to preview the generated page.
- **User Components (Draggable Elements):**
  - **Basic Elements:** `Button`, `Text`, `Heading`, `ImageComponent`, `DividerComponent`, `BadgeComponent`.
  - **Layout & Canvas:** `Container`, `CardComponent` (both support nesting other elements).
  - **Form Elements:** `InputComponent`, `TextareaComponent`, `SelectComponent`.
  - **Composite Elements:** Pre-assembled blocks including `LoginForm`, `HeroSection`, and `ContactForm`.
- **Styling:** Integrated with Tailwind CSS for rapid UI development and styling.

### Backend (Node.js + Express)
- **Code Compilation API:** An Express server (`server.js`) with an `/api/compile` endpoint.
- **Registry-Driven Compiler:** The backend mirrors the frontend's component registry (`component-registry.js`) to dynamically resolve props, styles, and nesting without hardcoded `if/else` logic.
- **AST to JSX Generator:** Uses Babel (`@babel/types` and `@babel/generator`) to parse the Craft.js AST and generate standalone, functional React JSX code from the visual layout.

---

## Things We Are Going to Make in the Future

### 1. Advanced Styling & Properties
- Enhance the `SettingsPanel` to support full CSS control (margins, borders, flexbox alignment, typography settings).
- Responsive design controls (mobile, tablet, desktop breakpoints) for components.

### 2. Data Persistence & User Accounts
- Integrate a database (e.g., MongoDB, PostgreSQL, or Firebase) to save, load, and manage projects.
- Implement user authentication (Sign up / Log in) so users can manage their own pages.

### 3. Interactive Elements & State
- Add the ability to assign actions to buttons (e.g., linking to URLs, showing alerts).
- Basic state management for the generated applications.

### 4. Export and Deployment
- Download project as a complete ZIP file (React/Next.js boilerplate).
- One-click deployment integration (e.g., Vercel, Netlify) to publish the generated JSX directly to the web.
- Code preview window with real-time syntax highlighting for the generated React code.

### 5. UI/UX Improvements
- A more premium and polished design aesthetic for the editor itself.
- Undo/Redo functionality and history tracking (currently partially implemented via Craft.js but needs UI hooks).
