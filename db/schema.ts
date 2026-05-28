import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

// ─── ENUMS ───────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "published", "archived"]);
export const inquiryStatusEnum = pgEnum("inquiry_status", ["new", "contacted", "quoted", "confirmed", "completed", "cancelled"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "paid", "completed", "cancelled", "refunded"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "partial", "paid", "refunded"]);
export const accommodationEnum = pgEnum("accommodation", ["shared", "private", "luxury"]);
export const departureStatusEnum = pgEnum("departure_status", ["open", "filling", "full", "cancelled", "completed"]);
export const ruleTypeEnum = pgEnum("rule_type", ["base", "season", "group", "accommodation", "earlybird", "lastminute"]);
export const modifierTypeEnum = pgEnum("modifier_type", ["percent", "fixed"]);

// ─── USERS (for auth) ────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("union_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── TOURS ───────────────────────────────────────────────────────────────────
export const tours = pgTable("tours", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  description: text("description"),
  days: integer("days").notNull().default(1),
  fromCity: varchar("from_city", { length: 100 }),
  toCity: varchar("to_city", { length: 100 }),
  price: varchar("price", { length: 50 }),
  image: varchar("image", { length: 500 }),
  itinerary: jsonb("itinerary").$type<{ day: number; title: string; route: string; desc: string; activities?: string[]; meals?: { breakfast?: boolean; lunch?: boolean; dinner?: boolean }; accommodation?: string; images?: string[] }[]>(),
  included: jsonb("included").$type<string[]>(),
  highlights: jsonb("highlights").$type<string[]>(),
  status: contentStatusEnum("status").default("draft").notNull(),
  featured: boolean("featured").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Tour = typeof tours.$inferSelect;
export type InsertTour = typeof tours.$inferInsert;

// ─── BLOG POSTS ──────────────────────────────────────────────────────────────
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  image: varchar("image", { length: 500 }),
  category: varchar("category", { length: 100 }),
  readTime: varchar("read_time", { length: 20 }),
  date: varchar("date", { length: 50 }),
  status: contentStatusEnum("status").default("draft").notNull(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ─── DESTINATIONS ─────────────────────────────────────────────────────────────
export const destinations = pgTable("destinations", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 500 }),
  category: varchar("category", { length: 100 }),
  featured: boolean("featured").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;

// ─── HIGHLIGHTS ───────────────────────────────────────────────────────────────
export const highlights = pgTable("highlights", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 500 }),
  category: varchar("category", { length: 100 }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Highlight = typeof highlights.$inferSelect;
export type InsertHighlight = typeof highlights.$inferInsert;

// ─── INQUIRIES ────────────────────────────────────────────────────────────────
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  tourId: varchar("tour_id", { length: 100 }),
  tourName: varchar("tour_name", { length: 255 }),
  message: text("message"),
  travelDate: varchar("travel_date", { length: 50 }),
  travelers: integer("travelers").default(1),
  status: inquiryStatusEnum("status").default("new").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  text: text("text").notNull(),
  rating: integer("rating").default(5),
  image: varchar("image", { length: 500 }),
  tourId: varchar("tour_id", { length: 100 }),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// ─── MEDIA FILES ──────────────────────────────────────────────────────────────
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }),
  mimeType: varchar("mime_type", { length: 100 }),
  size: integer("size"),
  width: integer("width"),
  height: integer("height"),
  altText: varchar("alt_text", { length: 500 }),
  folder: varchar("folder", { length: 100 }).default("uploads"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;

// ─── SEO SETTINGS ─────────────────────────────────────────────────────────────
export const seoSettings = pgTable("seo_settings", {
  pageRoute: varchar("page_route", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  keywords: text("keywords"),
  ogImage: varchar("og_image", { length: 500 }),
  ogType: varchar("og_type", { length: 50 }),
  canonical: varchar("canonical", { length: 500 }),
  schemaType: varchar("schema_type", { length: 100 }),
  customSchema: jsonb("custom_schema"),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SeoSetting = typeof seoSettings.$inferSelect;
export type InsertSeoSetting = typeof seoSettings.$inferInsert;

// ─── SITE SETTINGS ────────────────────────────────────────────────────────────
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value"),
  category: varchar("category", { length: 100 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 20 }).notNull().unique(),
  tourId: varchar("tour_id", { length: 100 }),
  tourName: varchar("tour_name", { length: 255 }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 320 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  customerCountry: varchar("customer_country", { length: 100 }),
  departureDate: varchar("departure_date", { length: 50 }),
  adults: integer("adults").default(1).notNull(),
  children: integer("children").default(0),
  accommodation: accommodationEnum("accommodation").default("shared"),
  totalPrice: integer("total_price"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  status: bookingStatusEnum("status").default("pending").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("unpaid"),
  depositAmount: integer("deposit_amount"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  source: varchar("source", { length: 50 }).default("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ─── STUDENT DEPARTURES ───────────────────────────────────────────────────────
export const studentDepartures = pgTable("student_departures", {
  id: serial("id").primaryKey(),
  tourId: varchar("tour_id", { length: 100 }),
  tourName: varchar("tour_name", { length: 255 }).notNull(),
  departureDate: varchar("departure_date", { length: 20 }).notNull(),
  returnDate: varchar("return_date", { length: 20 }).notNull(),
  maxSeats: integer("max_seats").default(16).notNull(),
  bookedSeats: integer("booked_seats").default(0).notNull(),
  pricePerPerson: integer("price_per_person"),
  status: departureStatusEnum("status").default("open").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type StudentDeparture = typeof studentDepartures.$inferSelect;
export type InsertStudentDeparture = typeof studentDepartures.$inferInsert;

// ─── PRICING RULES ────────────────────────────────────────────────────────────
export const pricingRules = pgTable("pricing_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  tourId: varchar("tour_id", { length: 100 }),
  ruleType: ruleTypeEnum("rule_type").notNull(),
  modifier: varchar("modifier", { length: 20 }).notNull(),
  modifierType: modifierTypeEnum("modifier_type").default("percent").notNull(),
  conditions: jsonb("conditions").$type<Record<string, unknown>>(),
  validFrom: varchar("valid_from", { length: 20 }),
  validTo: varchar("valid_to", { length: 20 }),
  priority: integer("priority").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type PricingRule = typeof pricingRules.$inferSelect;
export type InsertPricingRule = typeof pricingRules.$inferInsert;

// ─── ANALYTICS EVENTS ────────────────────────────────────────────────────────
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  tourId: varchar("tour_id", { length: 100 }),
  sessionId: varchar("session_id", { length: 100 }),
  data: jsonb("data").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
