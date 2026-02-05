# ER Diagram Editor

A modern, web-based Entity-Relationship (ER) diagram editor built with Next.js and React Flow. Design complex database schemas with an intuitive infinite canvas, support for advanced data types, and Crow's Foot notation for relationships.

![ER Diagram Editor Screenshot](public/screenshot-placeholder.png)

## ✨ Features

- **∞ Infinite Canvas**: Zoom, pan, and navigate large diagrams with ease using `xyflow`.
- **🏗️ Entity Management**:
  - Create and rename tables.
  - Add/Edit/Remove attributes inline.
  - Support for modern data types: `JSON`, `ARRAY`, `IMAGE`, `ENUM`, `FLOAT`, `DECIMAL`, `INT`, `VARCHAR`, `BOOLEAN`, `DATE`, `TEXT`.
  - Toggle Primary Key (PK) and Foreign Key (FK) constraints.
- **🔗 Advanced Relationships**:
  - Drag-and-drop connections between tables.
  - Full **Crow's Foot Notation** support (One, Many, Zero-or-One, Zero-or-Many, One-or-Many).
  - Configurable cardinality for both source and target ends.
- **⌨️ Keyboard Shortcuts**:
  - `Shift + N`: Add new Table.
  - `Shift + A`: Add Attribute to selected table.
  - `Delete` / `Backspace`: Remove selected table or relationship.
- **💾 Import / Export**:
  - Save your work as a JSON file.
  - Load existing diagrams from JSON.
  - Export high-quality PNG images of your diagram.
- **🎨 UX Enhancements**:
  - Smooth animations with Framer Motion.
  - Intuitive drag handles and hover effects.
  - Minimalist, clean UI with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Diagram Engine**: [@xyflow/react](https://reactflow.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Export**: [html-to-image](https://github.com/bubkoo/html-to-image)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mkurkar/er-diagram-app.git
   cd er-diagram-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to start designing!

## 📖 Usage Guide

- **Adding Tables:** Click the **+** icon in the top-left toolbar or press `Shift + N`.
- **Editing Names:** Double-click on any table name or attribute name to edit it inline.
- **Adding Attributes:** Select a table and press `Shift + A`, or use the **+** button in the Properties Panel.
- **Creating Relationships:** Drag from one handle (dot) on a table to another handle on a different table.
- **Configuring Relationships:** Click on a connection line to open the Edge Properties Panel, where you can set the cardinality (e.g., One-to-Many).
- **Moving:** Drag tables using the handle in the header. Hold `Shift` to select and move multiple tables.
- **Saving:** Use the floppy disk icon to save your diagram layout to a JSON file.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ by [mkurkar](https://github.com/mkurkar)
