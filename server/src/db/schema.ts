import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const reservations = pgTable("reservations", {
  id: text("id").primaryKey(),
  daybedId: text("daybed_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  daybedId: text("daybed_id").notNull(),
  lines: jsonb("lines").notNull(),
  totalChf: integer("total_chf").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
