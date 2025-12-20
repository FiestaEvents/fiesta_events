    
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
*   **Forms:** React Hook Form
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
```

The frontend will be available at `http://localhost:5173` (Vite default port).


## 🔌 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Core Endpoints

#### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password

#### Events

- `GET /events` - Get all events
- `POST /events` - Create new event
- `GET /events/:id` - Get event by ID
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `GET /events/calendar` - Get calendar view

#### Clients

- `GET /clients` - Get all clients
- `POST /clients` - Create new client
- `GET /clients/:id` - Get client by ID
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client

#### Partners

- `GET /partners` - Get all service partners
- `POST /partners` - Create new partner
- `GET /partners/:id` - Get partner by ID
- `PUT /partners/:id` - Update partner
- `DELETE /partners/:id` - Delete partner

#### Contracts

- `GET /contracts` - Get all contracts
- `POST /contracts` - Create new contract
- `GET /contracts/:id` - Get contract by ID
- `PUT /contracts/:id` - Update contract
- `DELETE /contracts/:id` - Delete contract
- `GET /contracts/:id/pdf` - Generate contract PDF
- `GET /contracts/settings` - Get contract settings
- `PUT /contracts/settings` - Update contract settings

#### Invoices

- `GET /invoices` - Get all invoices
- `POST /invoices` - Create new invoice
- `GET /invoices/:id` - Get invoice by ID
- `PUT /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice
- `GET /invoices/:id/pdf` - Generate invoice PDF
- `GET /invoices/settings` - Get invoice settings
- `PUT /invoices/settings` - Update invoice settings

#### Payments

- `GET /payments` - Get all payments
- `POST /payments` - Record new payment
- `GET /payments/:id` - Get payment by ID
- `PUT /payments/:id` - Update payment
- `DELETE /payments/:id` - Delete payment
- `GET /payments/stats` - Get payment statistics

#### Finance

- `GET /finance/dashboard` - Get financial dashboard
- `GET /finance/revenue` - Get revenue analytics
- `GET /finance/expenses` - Get expense analytics
- `GET /finance/profit` - Get profit analysis

#### Tasks

- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get task by ID
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PUT /tasks/:id/status` - Update task status
- `PUT /tasks/:id/assign` - Assign task to user

#### Reminders

- `GET /reminders` - Get all reminders
- `POST /reminders` - Create new reminder
- `GET /reminders/:id` - Get reminder by ID
- `PUT /reminders/:id` - Update reminder
- `DELETE /reminders/:id` - Delete reminder
- `POST /reminders/:id/snooze` - Snooze reminder

#### Team

- `GET /team/members` - Get team members
- `POST /team/invite` - Send team invitation
- `GET /team/invitations` - Get pending invitations
- `POST /team/invitations/:id/accept` - Accept invitation
- `DELETE /team/members/:id` - Remove team member

#### Roles & Permissions

- `GET /roles` - Get all roles
- `POST /roles` - Create new role
- `GET /roles/:id` - Get role by ID
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

#### Venues

- `GET /venues` - Get all venues
- `POST /venues` - Create new venue
- `GET /venues/:id` - Get venue by ID
- `PUT /venues/:id` - Update venue
- `DELETE /venues/:id` - Delete venue
- `GET /venues/:id/spaces` - Get venue spaces

---

## 📁 Project Structure

```
Fiesta/
├── fiesta_backend/          # Backend API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   ├── validators/      # Request validators
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── fiesta_events/           # Frontend Application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── api/             # API service layer
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Internationalization
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── clients/     # Client management
│   │   │   ├── contracts/   # Contract management
│   │   │   ├── events/      # Event management
│   │   │   ├── finance/     # Financial pages
│   │   │   ├── invoices/    # Invoice management
│   │   │   ├── partners/    # Partner management
│   │   │   ├── payments/    # Payment tracking
│   │   │   ├── reminders/   # Reminder management
│   │   │   ├── roles/       # Role management
│   │   │   ├── settings/    # Settings pages
│   │   │   ├── tasks/       # Task management
│   │   │   ├── team/        # Team management
│   │   │   ├── Dashboard.jsx
│   │   │   └── landing.jsx  # Landing page
│   │   ├── routes/          # Route definitions
│   │   ├── store/           # State management
│   │   ├── styles/          # Global styles
│   │   ├── utils/           # Utility functions
│   │   ├── app.jsx          # App component
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── scrennshots/             # Application screenshots
```

---

## 🌟 Key Features Breakdown

### 📅 Event Management

- Visual calendar with month/week/day views
- Drag-and-drop event scheduling
- Event status tracking (pending, confirmed, completed, cancelled)
- Conflict detection for double bookings
- Event templates for recurring events
- Guest list management
- Event notes and attachments

### 💼 Client Management

- Comprehensive client database
- Contact information and history
- Event history per client
- Client notes and tags
- Search and filter capabilities
- Import/export client data

### 🤝 Partner Management

- Service partner directory (photographers, caterers, decorators, etc.)
- Partner ratings and reviews
- Service categories and specializations
- Availability tracking
- Commission and payment tracking

### 📄 Contract System

- Customizable contract templates
- Digital signature support
- Contract versioning
- Status tracking (draft, sent, signed, expired)
- Automated reminders for unsigned contracts
- PDF generation and download

### 💰 Invoice & Payment Management

- Customizable invoice templates
- Multi-currency support
- Payment tracking (paid, pending, overdue)
- Partial payment support
- Automated payment reminders
- Receipt generation
- Financial reports and analytics

### ✅ Task Management

- Kanban board with drag-and-drop
- Task assignment to team members
- Priority levels (low, medium, high, urgent)
- Due date tracking
- Task comments and attachments
- Progress tracking
- Task templates

### 🔔 Reminder System

- Automated email notifications
- Customizable reminder schedules
- Snooze functionality
- Reminder categories (payment, event, task, contract)
- Recurring reminders

### 👥 Team Collaboration

- Role-based access control (Owner, Manager, Staff)
- Team member invitations
- Permission management
- Activity logs
- Team performance metrics

### 📊 Analytics & Reporting

- Revenue and expense tracking
- Profit/loss analysis
- Event statistics
- Client acquisition metrics
- Payment status overview
- Custom date range reports
- Export to PDF/Excel

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt encryption for passwords
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Express validator for request sanitization
- **MongoDB Sanitization** - Protection against NoSQL injection
- **Helmet.js** - Security headers for Express
- **CORS Configuration** - Controlled cross-origin requests
- **Role-Based Access Control** - Granular permission system

---

## 🌍 Internationalization

Fiesta supports multiple languages with full RTL (Right-to-Left) support:

- **Frensh**(Default)
- **English** 
- **Arabic** (العربية) with RTL layout

Language can be switched dynamically from the UI without page reload.

---

## 🎨 UI/UX Features

- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Dark Mode Ready** - Theme switching capability
- **Smooth Animations** - Framer Motion powered transitions
- **Toast Notifications** - Real-time feedback for user actions
- **Loading States** - Skeleton screens and spinners
- **Error Handling** - User-friendly error messages
- **Accessibility** - WCAG compliant components


## 🗺 Roadmap

### Coming Soon

- [ ] **Mobile Application** - Native iOS and Android apps
- [ ] **Marketplace** - Public venue and service partner discovery
- [ ] **Payment Gateway Integration** - Stripe, PayPal support
- [ ] **Advanced Analytics** - AI-powered insights
- [ ] **Email Marketing** - Integrated email campaigns
- [ ] **SMS Notifications** - Text message reminders
- [ ] **Calendar Sync** - Google Calendar, Outlook integration
- [ ] **Multi-venue Support** - Manage multiple venues from one account
- [ ] **White-label Solution** - Customizable branding
- [ ] **API Webhooks** - Real-time event notifications

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Fiesta Development Team**

- Website: [fiesta.events](https://fiesta.events)
- Email: support@fiesta.events

---

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- All open-source contributors whose libraries made this possible
- The event management community for valuable feedback

---

## 📞 Support

For support, email support@fiesta.events or join our community Discord server.

---

<div align="center">

**Made with ❤️ by the Fiesta Team**

⭐ Star us on GitHub — it motivates us a lot!

</div>
