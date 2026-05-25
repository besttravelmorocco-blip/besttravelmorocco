import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
// Public contact/enquiry form endpoint (called by public-facing app)
app.post("/api/contact", async (c) => {
  try {
    const body = await c.req.json();
    const { getDb } = await import("./queries/connection");
    const schema = await import("@db/schema");
    const db = getDb();
    await db.insert(schema.inquiries).values({
      name: body.name ?? "",
      email: body.email ?? "",
      phone: body.phone ?? null,
      tourId: body.tourId ?? null,
      tourName: body.tourName ?? null,
      message: body.message ?? null,
      travelDate: body.travelDate ?? null,
      travelers: body.travelers ?? 1,
      status: "new",
    });
    return c.json({ success: true });
  } catch {
    return c.json({ error: "Failed to save inquiry" }, 500);
  }
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
