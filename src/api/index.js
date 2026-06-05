/**
 * ============================================
 * Fiesta Events - API BARREL FILE
 * ============================================
 */

import { authService } from "./services/authService";
import { eventService } from "./services/eventService";
import { clientService } from "./services/clientService";
import { partnerService } from "./services/partnerService";
import { paymentService } from "./services/paymentService";
import { financeService } from "./services/financeService";
import { taskService } from "./services/taskService";
import { reminderService } from "./services/reminderService";
import { teamService } from "./services/teamService";
import { roleService } from "./services/roleService";
import {
  venueService,
  venueSpacesService,
  dashboardService,
} from "./services/venueService";
import { invoiceService } from "./services/invoiceService";
import { userService } from "./services/userService";
import { contractService } from "./services/contractService";
import { supplyService, supplyCategoryService } from "./services/supplyService";
import { portfolioService } from "./services/portfolioService.js";
import { adminService } from "./services/adminService.js";

export {
  authService,
  eventService,
  clientService,
  partnerService,
  paymentService,
  financeService,
  taskService,
  reminderService,
  teamService,
  roleService,
  venueService,
  venueSpacesService,
  dashboardService,
  invoiceService,
  userService,
  contractService,
  supplyService,
  supplyCategoryService,
  portfolioService,
  adminService,
};

// Default Export (Keeps `import API from 'api'; API.authService...` working)
export default {
  authService,
  eventService,
  clientService,
  partnerService,
  paymentService,
  financeService,
  taskService,
  reminderService,
  teamService,
  roleService,
  venueService,
  venueSpacesService,
  dashboardService,
  invoiceService,
  userService,
  contractService,
  supplyService,
  supplyCategoryService,
  portfolioService,
  adminService,
};
