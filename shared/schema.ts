import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  balance: integer("balance").default(2500).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isOperator: boolean("is_operator").default(false),
  isBanned: boolean("is_banned").default(false),
  activeNftEffects: jsonb("active_nft_effects"),
  lastLogin: timestamp("last_login"),
  lastDailyBonus: timestamp("last_daily_bonus"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  avatar: true,
  isAdmin: true,
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'game', 'purchase'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  description: true,
  type: true,
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  status: text("status"),
  categories: text("categories").array().notNull(),
  minBet: integer("min_bet").notNull(),
  maxBet: integer("max_bet").notNull(),
  houseEdge: doublePrecision("house_edge").notNull(),
});

export const insertGameSchema = createInsertSchema(games).pick({
  name: true,
  description: true,
  image: true,
  status: true,
  categories: true,
  minBet: true,
  maxBet: true,
  houseEdge: true,
});

// Game results table
export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  userId: integer("user_id").notNull().references(() => users.id),
  betAmount: integer("bet_amount").notNull(),
  winAmount: integer("win_amount").notNull(),
  isWin: boolean("is_win").notNull(),
  gameData: jsonb("game_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGameResultSchema = createInsertSchema(gameResults).pick({
  gameId: true,
  userId: true,
  betAmount: true,
  winAmount: true,
  isWin: true,
  gameData: true,
});

// NFTs table
export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  price: integer("price").notNull(),
  rarity: text("rarity").notNull(),
  category: text("category").notNull(),
  available: boolean("available").default(true).notNull(),
  hasEffect: boolean("has_effect").default(false),
  effectType: text("effect_type"), // 'background', 'avatar_frame', 'animation', 'particle'
  effectConfig: jsonb("effect_config"), // JSON configuration for the effect
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNFTSchema = createInsertSchema(nfts).pick({
  name: true,
  description: true,
  image: true,
  price: true,
  rarity: true,
  category: true,
  available: true,
  hasEffect: true,
  effectType: true,
  effectConfig: true,
});

// User NFTs (ownership) table
export const userNfts = pgTable("user_nfts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  nftId: integer("nft_id").notNull().references(() => nfts.id),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
});

export const insertUserNftSchema = createInsertSchema(userNfts).pick({
  userId: true,
  nftId: true,
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  reward: integer("reward").notNull(),
  requirement: text("requirement").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  image: true,
  reward: true,
  requirement: true,
});

// User Achievements table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
});

// Gacha items table
export const gachaItems = pgTable("gacha_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  type: text("type").notNull(), // 'coin', 'nft'
  rarity: text("rarity").notNull(), // 'common', 'rare', 'epic', 'legendary'
  value: integer("value").notNull(), // Coin amount or NFT ID
  dropRate: doublePrecision("drop_rate").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGachaItemSchema = createInsertSchema(gachaItems).pick({
  name: true,
  description: true,
  image: true,
  type: true,
  rarity: true,
  value: true,
  dropRate: true,
});

// Gacha draws table
export const gachaDraws = pgTable("gacha_draws", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => gachaItems.id),
  drawType: text("draw_type").notNull(), // 'single', 'multi'
  drawAt: timestamp("draw_at").defaultNow().notNull(),
});

export const insertGachaDrawSchema = createInsertSchema(gachaDraws).pick({
  userId: true,
  itemId: true,
  drawType: true,
});

// Define type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type GameResult = typeof gameResults.$inferSelect;
export type InsertGameResult = z.infer<typeof insertGameResultSchema>;

export type NFT = typeof nfts.$inferSelect;
export type InsertNFT = z.infer<typeof insertNFTSchema>;

export type UserNFT = typeof userNfts.$inferSelect;
export type InsertUserNFT = z.infer<typeof insertUserNftSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type GachaItem = typeof gachaItems.$inferSelect;
export type InsertGachaItem = z.infer<typeof insertGachaItemSchema>;

export type GachaDraw = typeof gachaDraws.$inferSelect;
export type InsertGachaDraw = z.infer<typeof insertGachaDrawSchema>;
