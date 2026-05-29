import { createRouter, publicQuery } from "./middleware.js";
import { authRouter } from "./auth-router.js";
import { dashboardRouter } from "./dashboard-router.js";
import { toursRouter } from "./tours-router.js";
import { inquiriesRouter } from "./inquiries-router.js";
import { settingsRouter } from "./settings-router.js";
import { seedRouter } from "./seed-router.js";
import { bookingsRouter } from "./bookings-router.js";
import { departuresRouter } from "./departures-router.js";
import { pricingRouter } from "./pricing-router.js";
import { analyticsRouter } from "./analytics-router.js";

export const appRouter = createRouter({
  greet: createRouter({
    greeting: publicQuery.query(() => "Hello from Best Travel Morocco Admin!"),
  }),
  auth: authRouter,
  dashboard: dashboardRouter,
  tours: toursRouter,
  inquiries: inquiriesRouter,
  settings: settingsRouter,
  seed: seedRouter,
  bookings: bookingsRouter,
  departures: departuresRouter,
  pricing: pricingRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
