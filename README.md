# 🎉 Fiesta - Event & Venue Management Platform

<div align="center">

![Fiesta Logo](public/fiesta%20logo-01.png)

**Transform Your Event Management Experience**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)](https://www.mongodb.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Screenshots](#-screenshots) • [API Documentation](#-api-documentation)

</div>

---

## 📖 Overview

**Fiesta** is a comprehensive, full-stack event and venue management platform designed to streamline the entire event lifecycle. From booking venues to managing contracts, invoices, and team collaboration, Fiesta provides an all-in-one solution for venue owners, event planners, and service partners.

### 🎯 Key Highlights

- **🏢 Venue Management** - Complete venue and space management with availability tracking
- **📅 Event Planning** - Intuitive calendar-based event scheduling and management
- **💼 Client & Partner Management** - Centralized database for clients and service partners
- **📄 Contract & Invoice Generation** - Automated contract creation and customizable invoicing
- **💰 Financial Tracking** - Real-time financial analytics and payment management
- **✅ Task Management** - Comprehensive task tracking with drag-and-drop Kanban boards
- **🔔 Smart Reminders** - Automated notifications for important deadlines
- **👥 Team Collaboration** - Role-based access control with team invitations
- **🌍 Multi-language Support** - Full internationalization (English & Arabic)
- **📊 Analytics Dashboard** - Real-time insights and performance metrics

---

## ✨ Features

### For Venue Owners

- **Smart Calendar Management** - Visual event scheduling with conflict detection
- **Financial Analytics** - Revenue tracking, expense management, and profit analysis
- **Team Management** - Role-based permissions and team collaboration tools
- **Automated Invoicing** - Customizable invoice templates with PDF generation
- **Contract Management** - Digital contract creation, tracking, and e-signatures
- **Space Management** - Multiple venue spaces with individual availability

### For Event Planners

- **Venue Discovery** - Browse and book venues through the marketplace
- **Service Partner Network** - Connect with photographers, caterers, decorators, and more
- **Real-time Booking** - Instant availability checks and booking confirmations
- **Event Dashboard** - Centralized view of all events and their status
- **Budget Tracking** - Monitor expenses and payments in real-time

### For Service Partners

- **Business Exposure** - Get discovered by venue owners and event planners
- **Booking Management** - Manage service requests and availability
- **Payment Integration** - Streamlined payment processing
- **Review System** - Build reputation through client reviews

---

## 🛠 Tech Stack

### Frontend (`fiesta_events`)

| Technology                 | Purpose                                  |
| -------------------------- | ---------------------------------------- |
| **React 19.2.0**           | Modern UI library with latest features   |
| **Vite 7.1**               | Lightning-fast build tool and dev server |
| **React Router 7.9**       | Client-side routing and navigation       |
| **TailwindCSS 3.4**        | Utility-first CSS framework              |
| **Framer Motion 12**       | Smooth animations and transitions        |
| **FullCalendar 6.1**       | Interactive event calendar               |
| **Chart.js 4.5**           | Data visualization and analytics         |
| **React Query 5.90**       | Server state management                  |
| **Zustand 5.0**            | Lightweight state management             |
| **i18next 25.6**           | Internationalization (EN/AR)             |
| **React Hook Form 7.65**   | Form validation and management           |
| **Axios 1.12**             | HTTP client for API requests             |
| **React PDF Renderer 4.3** | PDF generation for invoices/contracts    |
| **Lucide React**           | Beautiful icon library                   |
| **React Hot Toast**        | Elegant notification system              |

### Backend (`fiesta_backend`)

| Technology                  | Purpose                               |
| --------------------------- | ------------------------------------- |
| **Node.js**                 | JavaScript runtime environment        |
| **Express 4.21**            | Web application framework             |
| **MongoDB 8.20** (Mongoose) | NoSQL database with ODM               |
| **JWT**                     | Secure authentication & authorization |
| **bcryptjs**                | Password hashing                      |
| **Nodemailer 7.0**          | Email notifications                   |
| **PDFKit 0.17**             | Server-side PDF generation            |
| **Multer 2.0**              | File upload handling                  |
| **Helmet 7.1**              | Security middleware                   |
| **Express Rate Limit**      | API rate limiting                     |
| **Express Validator**       | Request validation                    |
| **Morgan**                  | HTTP request logger                   |
| **CORS**                    | Cross-origin resource sharing         |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **MongoDB** >= 6.x
- **npm** or **yarn**

### Installation

#### Backend Setup

```bash
cd fiesta_backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Seed database with sample data (optional)
npm run seed

# Start development server
npm run dev
```

**Backend Environment Variables** (`.env`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/venue-management
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

#### Frontend Setup

```bash
cd ../fiesta_events

# Install dependencies
npm install

# Start development server
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

- **English** (Default)
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
