export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Main
  DASHBOARD: '/dashboard',
  CALENDAR: '/calendar',

  // Events
  EVENTS: '/events',
  EVENT_DETAILS: (id) => `/events/${id}`,
  CREATE_EVENT: '/events/create',
  EDIT_EVENT: (id) => `/events/${id}/edit`,

  // Clients
  CLIENTS: '/clients',
  CLIENT_DETAILS: (id) => `/clients/${id}`,
  CREATE_CLIENT: '/clients/create',
  EDIT_CLIENT: (id) => `/clients/${id}/edit`,

  // Partners
  PARTNERS: '/partners',
  PARTNER_DETAILS: (id) => `/partners/${id}`,
  CREATE_PARTNER: '/partners/create',
  EDIT_PARTNER: (id) => `/partners/${id}/edit`,

  // Payments
  PAYMENTS: '/payments',
  PAYMENT_DETAILS: (id) => `/payments/${id}`,
  CREATE_PAYMENT: '/payments/create',

  // Invoices
  INVOICES: '/invoices',
  INVOICE_DETAILS: (id) => `/invoices/${id}`,
  CREATE_INVOICE: '/invoices/new',

  // Finance
  FINANCE: '/finance',
  FINANCE_REPORTS: '/finance/reports',
  CREATE_FINANCE: '/finance/create',

  // Tasks
  TASKS: '/tasks',
  TASK_BOARD: '/tasks/board',
  TASK_DETAILS: (id) => `/tasks/${id}`,
  CREATE_TASK: '/tasks/create',

  // Reminders
  REMINDERS: '/reminders',
  CREATE_REMINDER: '/reminders/create',

  // Team
  TEAM: '/team',
  INVITE_MEMBER: '/team/invite',
  MEMBER_DETAILS: (id) => `/team/${id}`,

  // Roles
  ROLES: '/roles',
  CREATE_ROLE: '/roles/create',
  EDIT_ROLE: (id) => `/roles/${id}/edit`,

  // Settings
  SETTINGS: '/settings',
  PROFILE_SETTINGS: '/settings/profile',
  VENUE_SETTINGS: '/settings/venue',
  SECURITY_SETTINGS: '/settings/security',
};

export const PERMISSIONS = {
  // Events
  EVENTS_CREATE: 'events.create',
  EVENTS_READ_ALL: 'events.read.all',
  EVENTS_UPDATE_ALL: 'events.update.all',
  EVENTS_DELETE_ALL: 'events.delete.all',
  
  // Clients
  CLIENTS_CREATE: 'clients.create',
  CLIENTS_READ_ALL: 'clients.read.all',
  CLIENTS_UPDATE_ALL: 'clients.update.all',
  CLIENTS_DELETE_ALL: 'clients.delete.all',
  
  // Partners
  PARTNERS_CREATE: 'partners.create',
  PARTNERS_READ_ALL: 'partners.read.all',
  PARTNERS_UPDATE_ALL: 'partners.update.all',
  PARTNERS_DELETE_ALL: 'partners.delete.all',
  
  // Finance
  FINANCE_CREATE: 'finance.create',
  FINANCE_READ_ALL: 'finance.read.all',
  FINANCE_UPDATE_ALL: 'finance.update.all',
  FINANCE_DELETE_ALL: 'finance.delete.all',
  
  // Payments
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_READ_ALL: 'payments.read.all',
  PAYMENTS_UPDATE_ALL: 'payments.update.all',
  
  // Tasks
  TASKS_CREATE: 'tasks.create',
  TASKS_READ_ALL: 'tasks.read.all',
  TASKS_UPDATE_ALL: 'tasks.update.all',
  
  // Team
  USERS_CREATE: 'users.create',
  USERS_READ_ALL: 'users.read.all',
  USERS_UPDATE_ALL: 'users.update.all',
  
  // Roles
  ROLES_CREATE: 'roles.create',
  ROLES_READ_ALL: 'roles.read.all',
  ROLES_UPDATE_ALL: 'roles.update.all',
  
  // Venue
  VENUE_UPDATE: 'venue.update',
  VENUE_MANAGE: 'venue.manage',
};