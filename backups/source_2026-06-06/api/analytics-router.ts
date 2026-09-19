import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";
import { eq, desc, count, sum, gte } from "drizzle-orm";
import { subDays, format } from "date-fns";

export const analyticsRouter = createRouter({
  overview: publicQuery
    .input(z.object({ days: z.number().default(30) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const since = format(subDays(new Date(), input?.days ?? 30), "yyyy-MM-dd HH:mm:ss");

      const [
        totalBookings,
        confirmedBookings,
        totalRevenue,
        recentBookings,
        totalInquiries,
        newInquiries,
        topTours,
      ] = await Promise.all([
        db.select({ count: count() }).from(schema.bookings),
        db.select({ count: count() }).from(schema.bookings).where(
          eq(schema.bookings.status, "confirmed")
        ),
        db.select({ total: sum(schema.bookings.totalPrice) }).from(schema.bookings).where(
          eq(schema.bookings.paymentStatus, "paid")
        ),
        db.select().from(schema.bookings)
          .where(gte(schema.bookings.createdAt, new Date(since)))
          .orderBy(desc(schema.bookings.createdAt))
          .limit(5),
        db.select({ count: count() }).from(schema.inquiries),
        db.select({ count: count() }).from(schema.inquiries).where(
          eq(schema.inquiries.status, "new")
        ),
        db.select({
          tourName: schema.bookings.tourName,
          count: count(),
        })
          .from(schema.bookings)
          .groupBy(schema.bookings.tourName)
          .orderBy(desc(count()))
          .limit(5),
      ]);

      // Inquiry status breakdown
      const inquiryBreakdown = await db
        .select({ status: schema.inquiries.status, count: count() })
        .from(schema.inquiries)
        .groupBy(schema.inquiries.status);

      // Booking status breakdown
      const bookingBreakdown = await db
        .select({ status: schema.bookings.status, count: count() })
        .from(schema.bookings)
        .groupBy(schema.bookings.status);

      return {
        bookings: {
          total: totalBookings[0]?.count ?? 0,
          confirmed: confirmedBookings[0]?.count ?? 0,
          breakdown: bookingBreakdown,
        },
        revenue: {
          total: Number(totalRevenue[0]?.total ?? 0),
        },
        inquiries: {
          total: totalInquiries[0]?.count ?? 0,
          new: newInquiries[0]?.count ?? 0,
          breakdown: inquiryBreakdown,
        },
        recentBookings,
        topTours: topTours.filter((t) => t.tourName),
      };
    }),

  track: publicQuery
    .input(z.object({
      eventType: z.string(),
      tourId: z.string().optional(),
      sessionId: z.string().optional(),
      data: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(schema.analyticsEvents).values(input);
      return { success: true };
    }),
});
