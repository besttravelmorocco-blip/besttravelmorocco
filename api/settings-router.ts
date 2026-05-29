import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  get: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, input.key)).limit(1);
      return rows[0] ?? null;
    }),

  getAll: publicQuery.query(async () => {
    const db = getDb();
    return await db.select().from(schema.siteSettings);
  }),

  set: publicQuery
    .input(z.object({
      key: z.string(),
      value: z.string(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, input.key)).limit(1);
      if (existing.length > 0) {
        await db.update(schema.siteSettings).set({ value: input.value, category: input.category }).where(eq(schema.siteSettings.key, input.key));
      } else {
        await db.insert(schema.siteSettings).values(input);
      }
      return { success: true };
    }),

  remove: publicQuery
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.siteSettings).where(eq(schema.siteSettings.key, input.key));
      return { success: true };
    }),
});
