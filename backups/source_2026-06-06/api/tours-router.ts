import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";
import { eq, like, desc, count, and } from "drizzle-orm";

export const toursRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.enum(["draft", "published", "archived"]).optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input ?? {};
      
      let query = db.select().from(schema.tours);
      
      const conditions = [];
      if (params.status) {
        conditions.push(eq(schema.tours.status, params.status));
      }
      if (params.search) {
        conditions.push(like(schema.tours.title, `%${params.search}%`));
      }
      
      if (conditions.length > 0) {
        return await query.where(and(...conditions)).orderBy(desc(schema.tours.updatedAt));
      }
      
      return await query.orderBy(desc(schema.tours.updatedAt));
    }),

  count: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({ count: count() }).from(schema.tours);
    return result[0]?.count ?? 0;
  }),

  getById: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(schema.tours).where(eq(schema.tours.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  create: publicQuery
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      days: z.number().min(1),
      fromCity: z.string().optional(),
      toCity: z.string().optional(),
      price: z.string().optional(),
      image: z.string().optional(),
      itinerary: z.any().optional(),
      included: z.array(z.string()).optional(),
      highlights: z.array(z.string()).optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
      featured: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(schema.tours).values(input);
      return { success: true };
    }),

  update: publicQuery
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      days: z.number().min(1).optional(),
      fromCity: z.string().optional(),
      toCity: z.string().optional(),
      price: z.string().optional(),
      image: z.string().optional(),
      itinerary: z.any().optional(),
      included: z.array(z.string()).optional(),
      highlights: z.array(z.string()).optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
      featured: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.tours).set(data).where(eq(schema.tours.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.tours).where(eq(schema.tours.id, input.id));
      return { success: true };
    }),
});
