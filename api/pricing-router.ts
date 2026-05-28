import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, and } from "drizzle-orm";

const ACCOMMODATION_MULTIPLIERS: Record<string, number> = {
  shared: 1.0,
  private: 1.35,
  luxury: 1.75,
};

const SEASON_MODIFIERS: Record<string, number> = {
  peak: 1.25,
  shoulder: 1.0,
  low: 0.85,
};

function getSeason(dateStr: string): "peak" | "shoulder" | "low" {
  const month = new Date(dateStr).getMonth() + 1;
  if (month >= 3 && month <= 5) return "peak";
  if (month >= 9 && month <= 11) return "peak";
  if (month === 12 || month === 1) return "shoulder";
  return "low";
}

export const pricingRouter = createRouter({
  list: publicQuery
    .input(z.object({ tourId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.tourId) {
        return await db.select().from(schema.pricingRules)
          .where(and(eq(schema.pricingRules.tourId, input.tourId), eq(schema.pricingRules.active, true)));
      }
      return await db.select().from(schema.pricingRules);
    }),

  create: publicQuery
    .input(z.object({
      name: z.string().min(1),
      tourId: z.string().optional(),
      ruleType: z.enum(["base", "season", "group", "accommodation", "earlybird", "lastminute"]),
      modifier: z.string(),
      modifierType: z.enum(["percent", "fixed"]).default("percent"),
      conditions: z.record(z.unknown()).optional(),
      validFrom: z.string().optional(),
      validTo: z.string().optional(),
      priority: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(schema.pricingRules).values({ ...input, active: true });
      return { success: true };
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      modifier: z.string().optional(),
      modifierType: z.enum(["percent", "fixed"]).optional(),
      conditions: z.record(z.unknown()).optional(),
      validFrom: z.string().optional(),
      validTo: z.string().optional(),
      priority: z.number().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(schema.pricingRules).set(data).where(eq(schema.pricingRules.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.pricingRules).where(eq(schema.pricingRules.id, input.id));
      return { success: true };
    }),

  calculate: publicQuery
    .input(z.object({
      basePrice: z.number().min(0),
      adults: z.number().min(1).default(1),
      children: z.number().min(0).default(0),
      accommodation: z.enum(["shared", "private", "luxury"]).default("shared"),
      departureDate: z.string().optional(),
      tourId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();

      // Load active rules for this tour (or global)
      const rules = await db.select().from(schema.pricingRules).where(
        eq(schema.pricingRules.active, true)
      );

      const tourRules = rules.filter(
        (r) => !r.tourId || r.tourId === input.tourId
      ).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      let price = input.basePrice;

      // Accommodation multiplier
      price = price * (ACCOMMODATION_MULTIPLIERS[input.accommodation] ?? 1);

      // Season modifier
      if (input.departureDate) {
        const season = getSeason(input.departureDate);
        price = price * (SEASON_MODIFIERS[season] ?? 1);
      }

      // Apply DB rules
      const appliedRules: { name: string; adjustment: number }[] = [];
      for (const rule of tourRules) {
        const mod = parseFloat(rule.modifier);
        if (isNaN(mod)) continue;

        let adjustment = 0;
        if (rule.modifierType === "percent") {
          adjustment = price * (mod / 100);
        } else {
          adjustment = mod;
        }

        price += adjustment;
        appliedRules.push({ name: rule.name, adjustment });
      }

      const perPerson = Math.round(price);
      const childPrice = Math.round(price * 0.6);
      const totalPrice = perPerson * input.adults + childPrice * input.children;

      return {
        perPerson,
        childPrice,
        totalPrice,
        adults: input.adults,
        children: input.children,
        accommodation: input.accommodation,
        season: input.departureDate ? getSeason(input.departureDate) : null,
        appliedRules,
      };
    }),
});
