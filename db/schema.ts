import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const wallets = sqliteTable("wallets", {
  address: text("address").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const strategies = sqliteTable("strategies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  walletAddress: text("wallet_address"),
  strategyId: text("strategy_id"),
  name: text("name").notNull(),
  description: text("description"),
  summary: text("summary"),
  riskLevel: text("risk_level"),
  inputToken: text("input_token"),
  aiModel: text("ai_model"),
  aiRequest: text("ai_request"),
  aiResponse: text("ai_response"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});
