import { createRouter, publicQuery } from "./middleware";
import { authRouter } from "./auth-router";
import { dashboardRouter } from "./dashboard-router";
import { toursRouter } from "./tours-router";
import { inquiriesRouter } from "./inquiries-router";
import { settingsRouter } from "./settings-router";
import { seedRouter } from "./seed-router";
import { bookingsRouter } from "./bookings-router";
import { departuresRouter } from "./departures-router";
import { pricingRouter } from "./pricing-router";
import { analyticsRouter } from "./analytics-router";

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
