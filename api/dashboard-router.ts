import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { count, eq, desc } from "drizzle-orm";

export const dashboardRouter = createRouter({
  stats: publicQuery.query(async () => {
    const db = getDb();
    
    const toursCount = await db.select({ count: count() }).from(schema.tours);
    const publishedTours = await db.select({ count: count() }).from(schema.tours).where(eq(schema.tours.status, "published"));
    const blogCount = await db.select({ count: count() }).from(schema.blogPosts);
    const inquiriesCount = await db.select({ count: count() }).from(schema.inquiries);
    const newInquiries = await db.select({ count: count() }).from(schema.inquiries).where(eq(schema.inquiries.status, "new"));
    const testimonialsCount = await db.select({ count: count() }).from(schema.testimonials);
    const mediaCount = await db.select({ count: count() }).from(schema.media);

    return {
      tours: toursCount[0]?.count ?? 0,
      publishedTours: publishedTours[0]?.count ?? 0,
      blogPosts: blogCount[0]?.count ?? 0,
      totalInquiries: inquiriesCount[0]?.count ?? 0,
      newInquiries: newInquiries[0]?.count ?? 0,
      testimonials: testimonialsCount[0]?.count ?? 0,
      mediaFiles: mediaCount[0]?.count ?? 0,
    };
  }),

  recentInquiries: publicQuery.query(async () => {
    const db = getDb();
    return await db.select().from(schema.inquiries).orderBy(desc(schema.inquiries.createdAt)).limit(5);
  }),

  topTours: publicQuery.query(async () => {
    const db = getDb();
    return await db.select().from(schema.tours).where(eq(schema.tours.status, "published")).orderBy(schema.tours.sortOrder).limit(10);
  }),
});
