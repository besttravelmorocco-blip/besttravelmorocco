import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";
import { count } from "drizzle-orm";
import { tours } from "../db/tours-data.js";

export const seedRouter = createRouter({
  status: publicQuery.query(async () => {
    const db = getDb();
    const toursCount = await db.select({ count: count() }).from(schema.tours);
    return {
      toursCount: toursCount[0]?.count ?? 0,
      totalTours: tours.length,
      needsSeeding: (toursCount[0]?.count ?? 0) === 0,
    };
  }),

  run: publicQuery.mutation(async () => {
    const db = getDb();
    let seeded = 0;
    let updated = 0;

    for (const tour of tours) {
      try {
        await db.insert(schema.tours).values({
          id: tour.id,
          title: tour.title,
          subtitle: tour.duration,
          description: tour.description,
          days: tour.days,
          fromCity: tour.from,
          toCity: tour.to,
          price: tour.price,
          image: tour.image,
          itinerary: tour.itinerary,
          included: tour.included,
          highlights: tour.highlights,
          status: "published",
          featured: tour.featured ?? false,
          sortOrder: 0,
        });
        seeded++;
      } catch (e: any) {
        // If duplicate, try update
        if (e.message?.includes("Duplicate") || e.code === "ER_DUP_ENTRY") {
          try {
            await db.update(schema.tours).set({
              title: tour.title,
              subtitle: tour.duration,
              description: tour.description,
              days: tour.days,
              fromCity: tour.from,
              toCity: tour.to,
              price: tour.price,
              image: tour.image,
              itinerary: tour.itinerary,
              included: tour.included,
              highlights: tour.highlights,
              featured: tour.featured ?? false,
            });
            updated++;
          } catch {
            // skip
          }
        }
      }
    }

    return { success: true, seeded, updated, total: tours.length };
  }),
});
