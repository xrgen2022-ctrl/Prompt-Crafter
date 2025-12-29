import { users, withdrawals, settings, type User, type UpsertUser, type Withdrawal, type InsertWithdrawal, type Setting, type InsertSetting } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // User extensions
  updateUserStats(userId: string, coinsChange: number, isCorrect: boolean): Promise<User>;
  getAllUsers(): Promise<User[]>; // For admin or leaderboard

  // Withdrawals
  createWithdrawal(withdrawal: InsertWithdrawal & { userId: string }): Promise<Withdrawal>;
  getWithdrawals(): Promise<(Withdrawal & { user: User })[]>;
  updateWithdrawalStatus(id: number, status: "approved" | "denied"): Promise<Withdrawal>;
  deductUserCoins(userId: string, amount: number): Promise<User>;

  // Settings
  getSettings(): Promise<Setting>;
  updateSettings(settings: InsertSetting): Promise<Setting>;

  // Math Game (in-memory for active questions)
  createMathQuestion(question: string, answer: number): Promise<string>; // returns ID
  getMathQuestion(id: string): Promise<{ question: string, answer: number } | undefined>;
  deleteMathQuestion(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods delegated to authStorage, but we can also implement them here directly if we want to override
  getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }
  upsertUser(user: UpsertUser): Promise<User> {
    return authStorage.upsertUser(user);
  }

  // User Stats
  async updateUserStats(userId: string, coinsChange: number, isCorrect: boolean): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    const newCoins = Math.max(0, (user.coins || 0) + coinsChange);
    const updates: Partial<User> = {
      coins: newCoins,
      totalQuestions: (user.totalQuestions || 0) + 1,
      correctAnswers: (user.correctAnswers || 0) + (isCorrect ? 1 : 0),
      incorrectAnswers: (user.incorrectAnswers || 0) + (isCorrect ? 0 : 1),
    };

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.coins));
  }

  // Withdrawals
  async createWithdrawal(withdrawal: InsertWithdrawal & { userId: string }): Promise<Withdrawal> {
    const [newWithdrawal] = await db.insert(withdrawals).values(withdrawal).returning();
    return newWithdrawal;
  }

  async getWithdrawals(): Promise<(Withdrawal & { user: User })[]> {
    const results = await db.select().from(withdrawals).leftJoin(users, eq(withdrawals.userId, users.id)).orderBy(desc(withdrawals.createdAt));
    return results.map(r => ({ ...r.withdrawals, user: r.users! }));
  }

  async updateWithdrawalStatus(id: number, status: "approved" | "denied"): Promise<Withdrawal> {
    const [updated] = await db.update(withdrawals).set({ status }).where(eq(withdrawals.id, id)).returning();
    return updated;
  }

  async deductUserCoins(userId: string, amount: number): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    const newCoins = Math.max(0, (user.coins || 0) - amount);
    const [updatedUser] = await db
      .update(users)
      .set({ coins: newCoins })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Settings
  async getSettings(): Promise<Setting> {
    const [setting] = await db.select().from(settings).limit(1);
    if (setting) return setting;
    // Create default if not exists
    const [newSetting] = await db.insert(settings).values({}).returning();
    return newSetting;
  }

  async updateSettings(newSettings: InsertSetting): Promise<Setting> {
    // ensure singleton
    const current = await this.getSettings();
    const [updated] = await db.update(settings).set({ ...newSettings, updatedAt: new Date() }).where(eq(settings.id, current.id)).returning();
    return updated;
  }

  // Math Game (In-Memory)
  private activeQuestions = new Map<string, { question: string, answer: number, expires: number }>();

  async createMathQuestion(question: string, answer: number): Promise<string> {
    const id = Math.random().toString(36).substring(7);
    this.activeQuestions.set(id, { question, answer, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry
    return id;
  }

  async getMathQuestion(id: string): Promise<{ question: string, answer: number } | undefined> {
    const q = this.activeQuestions.get(id);
    if (q && q.expires < Date.now()) {
      this.activeQuestions.delete(id);
      return undefined;
    }
    return q;
  }

  async deleteMathQuestion(id: string): Promise<void> {
    this.activeQuestions.delete(id);
  }
}

export const storage = new DatabaseStorage();
