import { users, inventoryItems, orders, orderItems, categories, activityLogs, tasks, alerts, notes, type User, type InsertUser, type InventoryItem, type InsertInventoryItem, type UpdateInventoryItem, type Order, type InsertOrder, type Category, type InsertCategory, type Task, type InsertTask, type Alert, type ActivityLog, type Note, type InsertNote } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, desc, sql, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  getInventoryItems(search?: string, category?: string, status?: string): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, updates: UpdateInventoryItem): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<void>;
  
  getInventoryStats(): Promise<{
    totalItems: number;
    lowStock: number;
    categories: number;
    totalValue: number;
  }>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getInventoryItems(search?: string, category?: string, status?: string): Promise<InventoryItem[]> {
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          ilike(inventoryItems.name, `%${search}%`),
          ilike(inventoryItems.sku, `%${search}%`)
        )
      );
    }
    
    if (category && category !== 'All Categories') {
      conditions.push(eq(inventoryItems.category, category));
    }
    
    if (status && status !== 'All Status') {
      if (status === 'Low Stock') {
        conditions.push(sql`${inventoryItems.stock} <= ${inventoryItems.lowStockAlert}`);
      } else if (status === 'Out of Stock') {
        conditions.push(eq(inventoryItems.stock, 0));
      } else if (status === 'In Stock') {
        conditions.push(sql`${inventoryItems.stock} > ${inventoryItems.lowStockAlert}`);
      }
    }
    
    if (conditions.length > 0) {
      return await db.select().from(inventoryItems).where(and(...conditions)).orderBy(desc(inventoryItems.updatedAt));
    }
    
    return await db.select().from(inventoryItems).orderBy(desc(inventoryItems.updatedAt));
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db
      .insert(inventoryItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateInventoryItem(id: number, updates: UpdateInventoryItem): Promise<InventoryItem | undefined> {
    const [item] = await db
      .update(inventoryItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
  }

  async getInventoryStats(): Promise<{
    totalItems: number;
    lowStock: number;
    categories: number;
    totalValue: number;
  }> {
    const items = await db.select().from(inventoryItems);
    
    const totalItems = items.length;
    const lowStock = items.filter(item => item.stock <= item.lowStockAlert).length;
    const categories = new Set(items.map(item => item.category)).size;
    const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.stock), 0);
    
    return {
      totalItems,
      lowStock,
      categories,
      totalValue
    };
  }
}

export const storage = new DatabaseStorage();
