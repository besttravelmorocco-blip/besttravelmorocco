import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  json,
  boolean,

} from "drizzle-orm/mysql-core";

// ─── USERS (for auth) ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── TOURS ───
export const tours = mysqlTable("tours", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  description: text("description"),
  days: int("days").notNull().default(1),
  fromCity: varchar("from_city", { length: 100 }),
  toCity: varchar("to_city", { length: 100 }),
  price: varchar("price", { length: 50 }),
  image: varchar("image", { length: 500 }),
  itinerary: json("itinerary").$type<{ day: number; title: string; route: string; desc: string; activities?: string[]; meals?: { breakfast?: boolean; lunch?: boolean; dinner?: boolean }; accommodation?: string; images?: string[] }[]>(),
  included: json("included").$type<string[]>(),
  highlights: json("highlights").$type<string[]>(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  featured: boolean("featured").default(false),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Tour = typeof tours.$inferSelect;
export type InsertTour = typeof tours.$inferInsert;

// ─── BLOG POSTS ───
export const blogPosts = mysqlTable("blog_posts", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  image: varchar("image", { length: 500 }),
  category: varchar("category", { length: 100 }),
  readTime: varchar("read_time", { length: 20 }),
  date: varchar("date", { length: 50 }),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ─── DESTINATIONS ───
export const destinations = mysqlTable("destinations", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 500 }),
  category: varchar("category", { length: 100 }),
  featured: boolean("featured").default(false),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;

// ─── HIGHLIGHTS ───
export const highlights = mysqlTable("highlights", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 500 }),
  category: varchar("category", { length: 100 }),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Highlight = typeof highlights.$inferSelect;
export type InsertHighlight = typeof highlights.$inferInsert;

// ─── INQUIRIES ───
export const inquiries = mysqlTable("inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  tourId: varchar("tour_id", { length: 100 }),
  tourName: varchar("tour_name", { length: 255 }),
  message: text("message"),
  travelDate: varchar("travel_date", { length: 50 }),
  travelers: int("travelers").default(1),
  status: mysqlEnum("status", ["new", "contacted", "quoted", "confirmed", "completed", "cancelled"]).default("new").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

// ─── TESTIMONIALS ───
export const testimonials = mysqlTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  text: text("text").notNull(),
  rating: int("rating").default(5),
  image: varchar("image", { length: 500 }),
  tourId: varchar("tour_id", { length: 100 }),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// ─── MEDIA FILES ───
export const media = mysqlTable("media", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }),
  mimeType: varchar("mime_type", { length: 100 }),
  size: int("size"),
  width: int("width"),
  height: int("height"),
  altText: varchar("alt_text", { length: 500 }),
  folder: varchar("folder", { length: 100 }).default("uploads"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;

// ─── SEO SETTINGS ───
export const seoSettings = mysqlTable("seo_settings", {
  pageRoute: varchar("page_route", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  keywords: text("keywords"),
  ogImage: varchar("og_image", { length: 500 }),
  ogType: varchar("og_type", { length: 50 }),
  canonical: varchar("canonical", { length: 500 }),
  schemaType: varchar("schema_type", { length: 100 }),
  customSchema: json("custom_schema"),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SeoSetting = typeof seoSettings.$inferSelect;
export type InsertSeoSetting = typeof seoSettings.$inferInsert;

// ─── SITE SETTINGS ───
export const siteSettings = mysqlTable("site_settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value"),
  category: varchar("category", { length: 100 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
