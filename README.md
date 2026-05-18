# AI Engineering Copilot (Frontend)

A stunning, lightning-fast, and zero-build Retrieval-Augmented Generation (RAG) Copilot interface. This repository contains the **Frontend UI** built with a modular Vanilla JS (ES6) and a premium Cyber-Dark Glassmorphic design system.

## 📁 Architecture
This application utilizes a highly scalable, modular directory structure requiring **zero bundler overhead** (no Webpack, no Vite). All files run natively in the browser via ES6 imports:

- `/css/`: Decoupled stylesheets for `base`, `layout`, `components`, and `chat` views.
- `/js/`: Modular ES6 controllers containing centralized `state.js`, API health syncs, routing, and isolated UI components.
- `app.js`: The central orchestrator that imports modules and binds DOM events.
- `index.html`: The core Single-Page Application (SPA) shell.

## 🚀 Setup & Execution

### 1. Environment Configuration
Ensure you have a `.env` file in the root directory to point to your backend neural engine (which runs in a separate repository):
```env
BACKEND_URL=http://localhost:3000
```

### 2. Install Dependencies
This project uses `http-server` as a lightweight static server to serve the ES6 modules securely without CORS issues.
```bash
npm install
```

### 3. Start the Development Server
```bash
npm start
```
*(By default, this attempts to run on `http://localhost:8080`. If port 8080 is already occupied by another service, you can manually run `npx http-server -p 8082`)*

Check your terminal output and click the local link (e.g., `http://127.0.0.1:8080`) to open the Copilot in your browser.

## 🌟 Key Features
- **Zero-Build Architecture**: Native ES6 dynamic imports (`type="module"`) provide rapid loading times, parallel file fetching, and instant developer feedback.
- **Cyber-Dark Aesthetics**: Implements modern glassmorphism, dynamic harmonious color palettes, and performant CSS-only hardware-accelerated animations.
- **RAG Dashboard**: View ledger tables and real-time statistics of vectors ingested into the Pinecone database.
- **Document Manager**: Drag-and-drop document upload pipelines with progressive animated steppers.
- **Dual Chat Interfaces**: Interact directly with the LLM via the *Direct Assistant*, or query your uploaded knowledge bases in the *Document Copilot* with expandable source-citation widgets.
- **Live Health Sync**: Continuous asynchronous background pings monitor the backend API, keeping the UI connection indicator synced in real-time.
