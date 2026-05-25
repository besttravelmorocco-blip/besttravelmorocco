import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc, count } from "drizzle-orm";

export const inquiriesRouter = createRouter({
  create: publicQuery
    .input(z.object({
      name: z.string().min(1),
      email: z.email(),
      phone: z.string().optional(),
      tourId: z.string().optional(),
      tourName: z.string().optional(),
      message: z.string().optional(),
      travelDate: z.string().optional(),
      travelers: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(schema.inquiries).values({
        ...input,
        travelers: input.travelers ?? 1,
        status: "new",
      });
      return { success: true };
    }),

  list: publicQuery.query(async () => {
    const db = getDb();
    return await db.select().from(schema.inquiries).orderBy(desc(schema.inquiries.createdAt));
  }),

  count: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({ count: count() }).from(schema.inquiries);
    return result[0]?.count ?? 0;
  }),

  byStatus: publicQuery.query(async () => {
    const db = getDb();
    const statuses = ["new", "contacted", "quoted", "confirmed", "completed", "cancelled"] as const;
    const counts: Record<string, number> = {};
    for (const s of statuses) {
      const result = await db.select({ count: count() }).from(schema.inquiries).where(eq(schema.inquiries.status, s));
      counts[s] = result[0]?.count ?? 0;
    }
    return counts;
  }),

  updateStatus: publicQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["new", "contacted", "quoted", "confirmed", "completed", "cancelled"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.inquiries).set(data).where(eq(schema.inquiries.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.inquiries).where(eq(schema.inquiries.id, input.id));
      return { success: true };
    }),
});
