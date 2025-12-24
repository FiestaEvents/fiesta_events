    
# 🎉 Fiesta - Frontend Client

The modern, responsive dashboard for the **Fiesta Venue Management Platform**. Built with React 19, Vite, and TailwindCSS, it features a dynamic permission system, multi-language support, and a polished UI.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)

## ✨ Key Features

*   **🛡️ Dynamic RBAC:** Real-time permission handling. Sidebar items and action buttons hide/disable based on the user's role.
*   **🌙 Dark Mode:** Fully supported system-wide dark/light theme toggling.
*   **🌍 Internationalization (i18n):** Full support for English, French, and Arabic (RTL layouts).
*   **🔐 Secure Auth:** Uses HttpOnly Cookies for session management (No tokens in LocalStorage).
*   **📊 Interactive Dashboards:** Kanban boards for Tasks, Calendar views for Events, and Chart.js for Finance.
*   **⚡ Real-time Feedback:** Toast notifications and optimistic UI updates.

## 🛠️ Tech Stack

*   **Core:** React 19, Vite, React Router DOM 6
*   **Styling:** TailwindCSS, Framer Motion (Animations), Lucide React (Icons)
*   **State Management:** Zustand (Global State), React Context (Auth/Theme)
*   **Forms:** React Hook Form, Zod
*   **Data Fetching:** Axios (with Interceptors for 401 handling)
*   **Utilities:** Date-fns, i18next, React Hot Toast

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   The Backend server must be running.

### 2. Installation
```bash
cd fiesta_events
npm install

  

3. Environment Setup

Create a .env file in the fiesta_events root:
code Env

    
# URL of the Backend API
VITE_API_URL=http://localhost:5000/api/v1

  

4. Run Development Server
code Bash

    
npm run dev

  

Access the app at http://localhost:5173 (or port 3000 depending on config).
📂 Project Structure
code Code

    
src/
├── api/             # Axios instance & Service layers (auth, events, etc.)
├── components/      
│   ├── auth/        # PermissionGuard.jsx (Protects UI elements)
│   ├── common/      # Reusable UI (Buttons, Inputs, Modals, Tables)
│   ├── layout/      # Sidebar, Topbar, Layout wrappers
│   └── shared/      # Shared complex views (SettingsLayout)
├── context/         # Auth, Theme, Language, Toast contexts
├── hooks/           # usePermission, useAuth, etc.
├── i18n/            # Locales (en.json, fr.json, ar.json)
├── pages/           # Route views (Dashboard, Events, Invoices, etc.)
├── routes/          # AppRoutes.jsx, ProtectedRoutes.jsx
└── utils/           # Formatters and helpers

  

🔒 Security Implementation

    HttpOnly Cookies: The frontend does not handle JWTs directly. Axios is configured with withCredentials: true.

    PermissionGuard: A wrapper component to protect specific buttons/sections:
    code Jsx

    
<PermissionGuard permission="events.create">
  <Button>Create Event</Button>
</PermissionGuard>

  

Auto-Logout: An Axios interceptor listens for 401 Unauthorized responses and triggers a global logout event.