import { getDb } from "../api/queries/connection";
import * as schema from "./schema";
import { tours } from "./tours-data";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();
  console.log("Seeding database with", tours.length, "tours...");

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
      console.log(`  + ${tour.title}`);
    } catch (e) {
      // Tour may already exist, try update
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
        }).where(eq(schema.tours.id, tour.id));
        console.log(`  ~ ${tour.title} (updated)`);
      } catch (e2) {
        console.log(`  ! ${tour.title} (skipped)`);
      }
    }
  }

  console.log("Done! Seeded", tours.length, "tours.");
}

seed().catch(console.error);
