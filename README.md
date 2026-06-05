    
# 🎉 Fiesta - Frontend Client

The modern, responsive dashboard for the **Fiesta Business Management Platform**. Built with React 19, Vite, and TailwindCSS, it features a "Chameleon Architecture" that adapts the UI based on the user's business category (Venue, Photography, Logistics, etc.), backed by a dynamic permission system and robust security.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)

## ✨ Key Features

*   **🛡️ Dynamic RBAC:** Real-time permission handling. Sidebar items and action buttons hide/disable automatically based on the user's role and permissions.
*   **🦎 Chameleon Dashboard:** The UI adapts based on the business vertical (e.g., Venues see "Spaces", Drivers see "Routes").
*   **🌙 Dark Mode:** Fully supported system-wide dark/light theme toggling.
*   **🌍 Internationalization (i18n):** Full support for English, French, and Arabic (RTL layouts).
*   **🔐 Secure Auth:** Uses **HttpOnly Cookies** for session management (No tokens stored in LocalStorage/SessionStorage) to prevent XSS.
*   **📊 Interactive Dashboards:** Kanban boards for Tasks, Calendar views for Events, and Chart.js for Finance.
*   **⚡ Real-time Feedback:** Toast notifications and optimistic UI updates.

## 🛠️ Tech Stack

*   **Core:** React 19, Vite, React Router DOM 6
*   **Styling:** TailwindCSS, Framer Motion (Animations), Lucide React (Icons)
*   **State Management:** Zustand (Global State), React Context (Auth/Theme)
*   **Forms:** React Hook Form
*   **Data Fetching:** Axios (configured with credentials and interceptors)
*   **Utilities:** Date-fns, i18next, React Hot Toast

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   **The Backend server must be running** at `http://localhost:5000`

### 2. Backend Setup (First)
If you haven't already, set up the backend to generate the necessary cookies and data:

```bash
cd ../fiesta_backend
npm install
npm run seed  # Critical: Populates DB with Roles, Permissions & Demo Accounts
npm run dev   # Starts server on port 5000

  

3. Frontend Installation
code Bash

    
cd fiesta_events
npm install

  

4. Environment Configuration

Create a .env file in the fiesta_events root:
code Env

    
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Fiesta

  

5. Start Development Server
code Bash

    
npm run dev

  

Access the app at http://localhost:5173.
6. Login with Demo Accounts

The seed script creates specific accounts for different verticals (Password for all: password123):

    Super Admin: admin@fiesta.com (Password: SuperAdmin123!)

    Venue Owner: venue@demo.com

    Photographer: photo@demo.com

    Driver: driver@demo.com

    Caterer: chef@demo.com

📂 Project Structure
code Text

    
src/
├── api/             # Axios instance & Service layers (auth, events, etc.)
├── components/      
│   ├── auth/        # PermissionGuard.jsx (Protects UI elements)
│   ├── common/      # Reusable UI (Buttons, Inputs, Modals, Tables)
│   ├── layout/      # Sidebar, Topbar, Layout wrappers
│   └── shared/      # Shared complex views (SettingsLayout)
├── context/         # Auth, Theme, Language, Toast, Notification contexts
├── hooks/           # Custom hooks (usePermission, useAuth, etc.)
├── i18n/            # Locales (en.json, fr.json, ar.json)
├── pages/           # Application views (Dashboard, Events, Invoices, etc.)
├── routes/          # AppRoutes.jsx, ProtectedRoutes.jsx, SuperAdminRoute.jsx
└── utils/           # Formatters and helpers

  

🔒 Security Implementation
HttpOnly Cookies & Authentication

The frontend does not handle JWTs directly in localStorage to mitigate XSS risks.

    Login: Backend sets an httpOnly cookie.

    Requests: Axios is configured with withCredentials: true, forcing the browser to send the cookie automatically.

    Logout: A global event listener detects 401 Unauthorized responses and triggers an immediate app-wide logout.

Permission Guards

We use a wrapper component to conditionally render UI elements based on backend-provided permission strings:
code Jsx

    
import PermissionGuard from "../../components/auth/PermissionGuard";

<PermissionGuard permission="events.create">
  <Button>Create Event</Button>
</PermissionGuard>

  

Session Management

    Initial Check: On mount, AuthContext pings /auth/me to verify the session.

    Silent Refresh: Window focus events trigger a background fetch to ensure permissions are up-to-date without reloading the page.