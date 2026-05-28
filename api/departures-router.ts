import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, desc, gte } from "drizzle-orm";
import { nextThursday, addDays, format, isAfter } from "date-fns";

function generateDepartures(startWeeks: number, count: number) {
  const departures: { departureDate: string; returnDate: string }[] = [];
  let cursor = new Date();

  // Walk forward to find the next Thursday
  let next = nextThursday(cursor);
  if (!isAfter(next, cursor)) {
    next = addDays(next, 7);
  }

  for (let i = 0; i < startWeeks; i++) {
    next = addDays(next, 7);
  }

  for (let i = 0; i < count; i++) {
    departures.push({
      departureDate: format(next, "yyyy-MM-dd"),
      returnDate: format(addDays(next, 3), "yyyy-MM-dd"),
    });
    next = addDays(next, 7);
  }

  return departures;
}

export const departuresRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        tourId: z.string().optional(),
        upcomingOnly: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input ?? {};
      let query = db.select().from(schema.studentDepartures);

      if (params.tourId) {
        return await query
          .where(eq(schema.studentDepartures.tourId, params.tourId))
          .orderBy(desc(schema.studentDepartures.departureDate));
      }

      if (params.upcomingOnly) {
        const today = format(new Date(), "yyyy-MM-dd");
        return await query
          .where(gte(schema.studentDepartures.departureDate, today))
          .orderBy(schema.studentDepartures.departureDate);
      }

      return await query.orderBy(desc(schema.studentDepartures.departureDate));
    }),

  generateForTour: publicQuery
    .input(z.object({
      tourId: z.string(),
      tourName: z.string(),
      count: z.number().min(1).max(52).default(12),
      startWeeks: z.number().min(0).default(0),
      maxSeats: z.number().min(1).default(16),
      pricePerPerson: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const dates = generateDepartures(input.startWeeks, input.count);

      const rows = dates.map((d) => ({
        tourId: input.tourId,
        tourName: input.tourName,
        departureDate: d.departureDate,
        returnDate: d.returnDate,
        maxSeats: input.maxSeats,
        bookedSeats: 0,
        pricePerPerson: input.pricePerPerson,
        status: "open" as const,
      }));

      await db.insert(schema.studentDepartures).values(rows);
      return { success: true, created: rows.length };
    }),

  updateSeats: publicQuery
    .input(z.object({
      id: z.number(),
      bookedSeats: z.number().min(0).optional(),
      maxSeats: z.number().min(1).optional(),
      status: z.enum(["open", "filling", "full", "cancelled", "completed"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.studentDepartures).set(data).where(eq(schema.studentDepartures.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.studentDepartures).where(eq(schema.studentDepartures.id, input.id));
      return { success: true };
    }),
});
