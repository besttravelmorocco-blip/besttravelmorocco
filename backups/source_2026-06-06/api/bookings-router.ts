import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";
import { eq, desc, count, sum, and, like } from "drizzle-orm";
import { nanoid } from "nanoid";

function generateReference() {
  return "BTM-" + nanoid(8).toUpperCase();
}

export const bookingsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.enum(["pending", "confirmed", "paid", "completed", "cancelled", "refunded"]).optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input ?? {};
      const conditions = [];

      if (params.status) {
        conditions.push(eq(schema.bookings.status, params.status));
      }
      if (params.search) {
        conditions.push(like(schema.bookings.customerName, `%${params.search}%`));
      }

      const query = db.select().from(schema.bookings);

      const rows = conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(schema.bookings.createdAt)).limit(params.limit ?? 50).offset(params.offset ?? 0)
        : await query.orderBy(desc(schema.bookings.createdAt)).limit(params.limit ?? 50).offset(params.offset ?? 0);

      return rows;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  create: publicQuery
    .input(z.object({
      tourId: z.string().optional(),
      tourName: z.string().optional(),
      customerName: z.string().min(1),
      customerEmail: z.string().email(),
      customerPhone: z.string().optional(),
      customerCountry: z.string().optional(),
      departureDate: z.string().optional(),
      adults: z.number().min(1).default(1),
      children: z.number().min(0).default(0),
      accommodation: z.enum(["shared", "private", "luxury"]).optional(),
      totalPrice: z.number().optional(),
      currency: z.string().default("USD"),
      depositAmount: z.number().optional(),
      notes: z.string().optional(),
      source: z.string().default("website"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const reference = generateReference();
      await db.insert(schema.bookings).values({ ...input, reference });
      return { success: true, reference };
    }),

  updateStatus: publicQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "confirmed", "paid", "completed", "cancelled", "refunded"]).optional(),
      paymentStatus: z.enum(["unpaid", "partial", "paid", "refunded"]).optional(),
      internalNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.bookings).set(data).where(eq(schema.bookings.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.bookings).where(eq(schema.bookings.id, input.id));
      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const [total, confirmed, revenue] = await Promise.all([
      db.select({ count: count() }).from(schema.bookings),
      db.select({ count: count() }).from(schema.bookings).where(
        eq(schema.bookings.status, "confirmed")
      ),
      db.select({ total: sum(schema.bookings.totalPrice) }).from(schema.bookings).where(
        and(
          eq(schema.bookings.paymentStatus, "paid")
        )
      ),
    ]);
    return {
      total: total[0]?.count ?? 0,
      confirmed: confirmed[0]?.count ?? 0,
      revenue: Number(revenue[0]?.total ?? 0),
    };
  }),
});
