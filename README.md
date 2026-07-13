# DropShip 🚀

DropShip is a powerful visual page builder that allows users to drag-and-drop components onto a canvas and generate standalone React JSX code via a robust Node.js compilation API. It leverages modern web technologies to provide a seamless and intuitive UI/UX for building responsive applications.

## 🌟 Features

### Frontend (React + Vite + Craft.js)
- **Visual Editor Interface:** Drag-and-drop page builder layout with a central canvas.
- **Dynamic Component Registry:** A centralized registry that manages all components, props, and configurations dynamically instead of relying on hardcoded arrays.
- **Editor Components:**
  - **Topbar:** Navigation and high-level actions (previewing/exporting).
  - **Toolbox:** Searchable, categorized palettes of draggable components driven by the registry.
  - **Settings Panel:** Edit properties of the currently selected component.
  - **Preview Modal:** Preview the generated page.
- **User Components (Draggable Elements):**
  - **Basic Elements:** Button, Text, Heading, Image, Divider, Badge.
  - **Layout & Canvas:** Container, Card (both support nesting other elements).
  - **Form Elements:** Input, Textarea, Select.
  - **Composite Elements:** Pre-assembled blocks including Login Form, Hero Section, and Contact Form.
- **Styling:** Integrated with Tailwind CSS for rapid UI development and styling.

### Backend (Node.js + Express)
- **Code Compilation API:** An Express server providing an `/api/compile` endpoint.
- **Registry-Driven Compiler:** Mirrors the frontend's component registry to dynamically resolve props, styles, and nesting without hardcoded `if/else` logic.
- **AST to JSX Generator:** Uses Babel (`@babel/types` and `@babel/generator`) to parse the Craft.js AST and generate standalone, functional React JSX code from the visual layout.

## 💻 Tech Stack

### Frontend
- **React 19**
- **Vite**
- **Craft.js** (for drag-and-drop mechanics and AST)
- **Tailwind CSS v4** (for styling)
- **Zustand** (for state management)
- **Lucide React** (for icons)
- **TanStack React Query** (for data fetching)
- **TypeScript**

### Backend
- **Node.js**
- **Express.js**
- **Babel** (`@babel/types`, `@babel/generator`) for AST transformation and code generation.

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/dhruvil-d/DropShip.git
cd DropShip
```

### 2. Set up the Backend
```bash
cd backend
npm install
node server.js
```
The backend server will start running and listening for compilation requests.

### 3. Set up the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the App
Navigate to the local URL provided by Vite (usually `http://localhost:5173`) in your browser to start using the visual builder.

## 🗺️ Roadmap (Future Development)

### 1. Advanced Styling & Properties
- Enhance the Settings Panel to support full CSS control (margins, borders, flexbox alignment, typography settings).
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
- Undo/Redo functionality and history tracking.

## 🤝 Contributing

Contributions are always welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
