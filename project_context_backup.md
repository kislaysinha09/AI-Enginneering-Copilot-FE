# AI Engineering Copilot - Project & Conversation Context Backup

*Generated as a persistent backup of the agent conversation history, project context, and architectural decisions.*

## 1. Project Overview
The AI Engineering Copilot is a Retrieval-Augmented Generation (RAG) platform consisting of two main components running locally:
* **Frontend (FE):** A modular, zero-build Vanilla JS Single-Page Application (SPA) utilizing a custom Cyber-Dark Glassmorphic design system.
* **Backend (BE):** A Node.js Express server handling Pinecone vector ingestion, semantic document chunking, and LLM generative logic.

---

## 2. Recent Architectural Evolution (Frontend)
The frontend was recently refactored from a monolithic structure (single `styles.css` and massive `app.js`) into a highly scalable, decoupled **ES6 Native Module Architecture** without relying on bundlers like Webpack or Vite.

### 🎨 CSS Modularization
The original monolithic stylesheet was split into four dedicated files inside the `/css/` directory:
- `base.css`: CSS variables (theme colors, fonts), resets, custom scrollbars, and keyframe animations.
- `layout.css`: App shell structure, sidebar navigation, logo pulses, and SPA view containers.
- `components.css`: Buttons, stats grid, ledger tables, drag-and-drop zones, and stepper progress pipelines.
- `chat.css`: Speech bubbles, typing indicators, code block formatting, and RAG citation tags.

### ⚙️ JavaScript Modularization
The original `app.js` was transformed into a lightweight orchestrator that imports specific logic controllers from the `/js/` directory:
- `state.js`: Global state management (`documents`, `chatHistory`, etc.).
- `config.js`: Dynamically parses configuration variables from `.env`.
- `router.js`: Handles DOM view transitions for the SPA and viewport scrolling.
- `api.js`: Continuously polls the backend `/health` endpoint to update the "Neural Engine Connected" indicator in real-time.
- `components/dashboard.js`: Computes chunk aggregates and renders the vector ingestion ledger table.
- `components/manager.js`: Handles the document drop zone, FormData API uploads, mock stepper animations, and local registry deletion.
- `components/chats.js`: Manages both Direct Assistant and Document Copilot chat interfaces, prompt suggestions, markdown parsing, and UI message rendering.

---

## 3. Communication Patterns & API Integrations
- **Health Sync:** The frontend utilizes `AbortController` to strictly ping `http://localhost:3000/health` every 10 seconds with a 2-second timeout, allowing the UI connection dot to toggle instantly if the backend goes offline.
- **Document Ingestion:** Documents dropped in the UI are sent via `FormData` to `/api/documents/upload`. The frontend displays a 4-step progressive pipeline (Text Extraction -> Semantic Chunking -> Vector Embedding -> Pinecone Indexing) while awaiting the backend response.
- **Direct Generative Queries:** The frontend sends standard queries to `/api/ask` for general LLM answers without local document context.
- **RAG Vector Queries:** The frontend hits `/api/query` for context-aware searches. The UI captures backend citations and renders them as interactive, expandable source cards inside the chat bubble.

---

## 4. Current Environment State & Workflows
- **CORS & Static Serving:** The frontend operates on `http-server` (usually on port `8080` or `8082`) to prevent CORS issues and resolve ES6 import paths correctly within the browser.
- **Backend Reloads:** The backend utilizes standard `node index.js`. We verified that if routes (like `/health`) are modified, the backend terminal process must be manually restarted (`Ctrl+C` -> `npm start`) for changes to take effect.
- **Version Control:** Both repositories have been equipped with `.gitignore` files tailored to exclude `node_modules/`, `.env`, `.DS_Store`, and backend `uploads/`.
- **Documentation:** `README.md` files have been tailored strictly to their respective environments (the FE README exclusively dictates modular ES6 setup without bleeding backend noise).
