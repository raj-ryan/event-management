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

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private userStore: Map<number, User>;
  private eventStore: Map<number, Event>;
  private venueStore: Map<number, Venue>;
  private bookingStore: Map<number, Booking>;
  private paymentStore: Map<number, Payment>;
  private notificationStore: Map<number, Notification>;
  
  userId: number;
  eventId: number;
  venueId: number;
  bookingId: number;
  paymentId: number;
  notificationId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.userStore = new Map();
    this.eventStore = new Map();
    this.venueStore = new Map();
    this.bookingStore = new Map();
    this.paymentStore = new Map();
    this.notificationStore = new Map();
    
    this.userId = 1;
    this.eventId = 1;
    this.venueId = 1;
    this.bookingId = 1;
    this.paymentId = 1;
    this.notificationId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.userStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...userData, id, role: "user", createdAt };
    this.userStore.set(id, user);
    return user;
  }
  
  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    return this.eventStore.get(id);
  }
  
  async getEvents(limit: number = 10, offset: number = 0): Promise<Event[]> {
    return Array.from(this.eventStore.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(offset, offset + limit);
  }
  
  async getEventsByCategory(category: string, limit: number = 10, offset: number = 0): Promise<Event[]> {
    return Array.from(this.eventStore.values())
      .filter(event => event.category === category)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(offset, offset + limit);
  }
  
  async getEventsByVenue(venueId: number): Promise<Event[]> {
    return Array.from(this.eventStore.values())
      .filter(event => event.venueId === venueId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getEventsByUser(userId: number): Promise<Event[]> {
    return Array.from(this.eventStore.values())
      .filter(event => event.createdBy === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const createdAt = new Date();
    const event: Event = { ...eventData, id, createdAt };
    this.eventStore.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.eventStore.get(id);
    if (!existingEvent) return undefined;
    
    const updatedEvent: Event = { ...existingEvent, ...eventData };
    this.eventStore.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.eventStore.delete(id);
  }
  
  // Venue operations
  async getVenue(id: number): Promise<Venue | undefined> {
    return this.venueStore.get(id);
  }
  
  async getVenues(limit: number = 10, offset: number = 0): Promise<Venue[]> {
    return Array.from(this.venueStore.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(offset, offset + limit);
  }
  
  async createVenue(venueData: InsertVenue): Promise<Venue> {
    const id = this.venueId++;
    const createdAt = new Date();
    const venue: Venue = { ...venueData, id, createdAt };
    this.venueStore.set(id, venue);
    return venue;
  }
  
  async updateVenue(id: number, venueData: Partial<InsertVenue>): Promise<Venue | undefined> {
    const existingVenue = this.venueStore.get(id);
    if (!existingVenue) return undefined;
    
    const updatedVenue: Venue = { ...existingVenue, ...venueData };
    this.venueStore.set(id, updatedVenue);
    return updatedVenue;
  }
  
  async deleteVenue(id: number): Promise<boolean> {
    return this.venueStore.delete(id);
  }
  
  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookingStore.get(id);
  }
  
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookingStore.values())
      .filter(booking => booking.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getBookingsByEvent(eventId: number): Promise<Booking[]> {
    return Array.from(this.bookingStore.values())
      .filter(booking => booking.eventId === eventId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    const createdAt = new Date();
    const booking: Booking = { ...bookingData, id, createdAt };
    this.bookingStore.set(id, booking);
    return booking;
  }
  
  async updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const existingBooking = this.bookingStore.get(id);
    if (!existingBooking) return undefined;
    
    const updatedBooking: Booking = { ...existingBooking, ...bookingData };
    this.bookingStore.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async deleteBooking(id: number): Promise<boolean> {
    return this.bookingStore.delete(id);
  }
  
  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.paymentStore.get(id);
  }
  
  async getPaymentsByUser(userId: number): Promise<Payment[]> {
    return Array.from(this.paymentStore.values())
      .filter(payment => payment.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return Array.from(this.paymentStore.values())
      .filter(payment => payment.bookingId === bookingId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const createdAt = new Date();
    const payment: Payment = { ...paymentData, id, createdAt };
    this.paymentStore.set(id, payment);
    return payment;
  }
  
  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existingPayment = this.paymentStore.get(id);
    if (!existingPayment) return undefined;
    
    const updatedPayment: Payment = { ...existingPayment, ...paymentData };
    this.paymentStore.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Notification operations
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationStore.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const createdAt = new Date();
    const notification: Notification = { ...notificationData, id, createdAt };
    this.notificationStore.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const existingNotification = this.notificationStore.get(id);
    if (!existingNotification) return undefined;
    
    const updatedNotification: Notification = { ...existingNotification, read: true };
    this.notificationStore.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();
