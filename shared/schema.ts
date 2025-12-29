export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  paymentMode: text("payment_mode", { enum: ["GCash", "Maya"] }).notNull(),
  accountDetails: text("account_details").notNull(),
  status: text("status", { enum: ["pending", "approved", "denied"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  rewardAmount: integer("reward_amount").default(2).notNull(),
  penaltyAmount: integer("penalty_amount").default(2).notNull(),
  conversionRate: integer("conversion_rate").default(100).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
}));

export const insertWithdrawalSchema = createInsertSchema(withdrawals).pick({
  amount: true,
  paymentMode: true,
  accountDetails: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;
