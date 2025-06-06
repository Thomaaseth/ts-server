// import { boolean } from "drizzle-orm/gel-core";
import { pgTable, timestamp, varchar, uuid, text, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar("email", { length: 256 }).unique().notNull(),
  hashed_password: varchar("hashed_password").notNull().default("unset"),
  isChirpyRed: boolean("is_chirpy_red").default(false)
});

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect; 

export const chirps = pgTable("chirps", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  body: text("body").notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" })
})

export type NewChirp = typeof chirps.$inferInsert;

export const refresh_token = pgTable("refresh_token", {
  token: text("token").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at")
})

export type NewRefreshToken = typeof refresh_token.$inferInsert;