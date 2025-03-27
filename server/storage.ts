import {
  users, User, InsertUser,
  events, Event, InsertEvent,
  venues, Venue, InsertVenue,
  bookings, Booking, InsertBooking,
  payments, Payment, InsertPayment,
  notifications, Notification, InsertNotification
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getEvents(limit?: number, offset?: number): Promise<Event[]>;
  getEventsByCategory(category: string, limit?: number, offset?: number): Promise<Event[]>;
  getEventsByVenue(venueId: number): Promise<Event[]>;
  getEventsByUser(userId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Venue operations
  getVenue(id: number): Promise<Venue | undefined>;
  getVenues(limit?: number, offset?: number): Promise<Venue[]>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: number, venue: Partial<InsertVenue>): Promise<Venue | undefined>;
  deleteVenue(id: number): Promise<boolean>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByEvent(eventId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByUser(userId: number): Promise<Payment[]>;
  getPaymentsByBooking(bookingId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // Notification operations
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Session store
  sessionStore: any; // Use any for session store to avoid type errors
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: any; // Use any for session store to avoid type errors

  constructor() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    this.sessionStore = new PostgresSessionStore({
      pool: pgPool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }
  
  async getEvents(limit: number = 10, offset: number = 0): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.date)).limit(limit).offset(offset);
  }
  
  async getEventsByCategory(category: string, limit: number = 10, offset: number = 0): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.category, category))
      .orderBy(desc(events.date))
      .limit(limit)
      .offset(offset);
  }
  
  async getEventsByVenue(venueId: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.venueId, venueId))
      .orderBy(desc(events.date));
  }
  
  async getEventsByUser(userId: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.createdBy, userId))
      .orderBy(desc(events.date));
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result !== null;
  }
  
  // Venue operations
  async getVenue(id: number): Promise<Venue | undefined> {
    const [venue] = await db.select().from(venues).where(eq(venues.id, id));
    return venue;
  }
  
  async getVenues(limit: number = 10, offset: number = 0): Promise<Venue[]> {
    return await db
      .select()
      .from(venues)
      .orderBy(asc(venues.name))
      .limit(limit)
      .offset(offset);
  }
  
  async createVenue(venueData: InsertVenue): Promise<Venue> {
    const [venue] = await db.insert(venues).values(venueData).returning();
    return venue;
  }
  
  async updateVenue(id: number, venueData: Partial<InsertVenue>): Promise<Venue | undefined> {
    const [updatedVenue] = await db
      .update(venues)
      .set(venueData)
      .where(eq(venues.id, id))
      .returning();
    
    return updatedVenue;
  }
  
  async deleteVenue(id: number): Promise<boolean> {
    const result = await db.delete(venues).where(eq(venues.id, id));
    return result !== null;
  }
  
  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }
  
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }
  
  async getBookingsByEvent(eventId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId))
      .orderBy(desc(bookings.createdAt));
  }
  
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    return booking;
  }
  
  async updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    
    return updatedBooking;
  }
  
  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return result !== null;
  }
  
  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }
  
  async getPaymentsByUser(userId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }
  
  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .orderBy(desc(payments.createdAt));
  }
  
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }
  
  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set(paymentData)
      .where(eq(payments.id, id))
      .returning();
    
    return updatedPayment;
  }
  
  // Notification operations
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }
  
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    
    return updatedNotification;
  }
}

export const storage = new DatabaseStorage();
