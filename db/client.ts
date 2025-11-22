import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const databaseFile = process.env.DATABASE_FILE || "nir.sqlite";

const sqlite = new Database(databaseFile);

export const db = drizzle(sqlite);
export * from "./schema";
