import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const eventStatusEnum = pgEnum('event_status', ['upcoming', 'ongoing', 'completed', 'cancelled']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'organizer']);
export const notificationTypeEnum = pgEnum('notification_type', ['info', 'success', 'warning', 'error']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("firebase_uid").unique(), // Firebase UID for authentication
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"), // Can be null for Firebase auth users
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  phone: text("phone"),
  profileImage: text("profile_image"),
  photoURL: text("photo_url"), // URL to Firebase user's profile photo
  role: text("role").default("user").notNull(),
  stripeCustomerId: text("stripe_customer_id"), // For Stripe integration
  stripeSubscriptionId: text("stripe_subscription_id"), // For Stripe subscriptions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Venues table
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  zipCode: text("zip_code"),
  capacity: integer("capacity").notNull(),
  amenities: text("amenities").array(),
  price: doublePrecision("price").notNull(),
  image: text("image"),
  description: text("description"),
  createdBy: integer("created_by").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  venueId: integer("venue_id").references(() => venues.id).notNull(),
  capacity: integer("capacity").notNull(),
  price: doublePrecision("price").notNull(),
  category: text("category").notNull(),
  image: text("image"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  status: text("status").default("upcoming").notNull(),
  isPublished: boolean("is_published").default(false),
  liveStatus: boolean("live_status").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id),
  venueId: integer("venue_id").references(() => venues.id),
  bookingDate: timestamp("booking_date"),
  bookingDuration: integer("booking_duration"), // in hours
  attendeeCount: integer("attendee_count"),
  status: text("status", { enum: ["pending", "confirmed", "cancelled", "completed"] }).default("pending").notNull(),
  paymentStatus: text("payment_status", { enum: ["pending", "completed", "failed", "refunded"] }).default("pending").notNull(),
  ticketCount: integer("ticket_count").default(1).notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  amount: doublePrecision("amount").notNull(),
  status: text("status").default("pending").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Attendees table
export const attendees = pgTable("attendees", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  hasCheckedIn: boolean("has_checked_in").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  serviceType: text("service_type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Event Vendors junction table
export const eventVendors = pgTable("event_vendors", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  read: boolean("read").default(false),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events, { relationName: "userEvents" }),
  bookings: many(bookings, { relationName: "userBookings" }),
  venues: many(venues, { relationName: "userVenues" }),
  notifications: many(notifications, { relationName: "userNotifications" }),
  payments: many(payments, { relationName: "userPayments" }),
}));

export const venuesRelations = relations(venues, ({ one, many }) => ({
  creator: one(users, {
    fields: [venues.createdBy],
    references: [users.id],
    relationName: "userVenues",
  }),
  events: many(events, { relationName: "venueEvents" }),
  bookings: many(bookings, { relationName: "venueBookings" }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.id],
    relationName: "venueEvents",
  }),
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
    relationName: "userEvents",
  }),
  bookings: many(bookings, { relationName: "eventBookings" }),
  eventVendors: many(eventVendors, { relationName: "eventVendorConnections" }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
    relationName: "userBookings",
  }),
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id],
    relationName: "eventBookings",
  }),
  venue: one(venues, {
    fields: [bookings.venueId],
    references: [venues.id],
    relationName: "venueBookings",
  }),
  payment: many(payments, { relationName: "bookingPayment" }),
  attendees: many(attendees, { relationName: "bookingAttendees" }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
    relationName: "bookingPayment",
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
    relationName: "userPayments",
  }),
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  eventVendors: many(eventVendors, { relationName: "vendorEvents" }),
}));

export const eventVendorsRelations = relations(eventVendors, ({ one }) => ({
  event: one(events, {
    fields: [eventVendors.eventId],
    references: [events.id],
    relationName: "eventVendorConnections",
  }),
  vendor: one(vendors, {
    fields: [eventVendors.vendorId],
    references: [vendors.id],
    relationName: "vendorEvents",
  }),
}));

export const attendeesRelations = relations(attendees, ({ one }) => ({
  booking: one(bookings, {
    fields: [attendees.bookingId],
    references: [bookings.id],
    relationName: "bookingAttendees",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "userNotifications",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  uid: true,
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  bio: true,
  phone: true,
  profileImage: true,
  photoURL: true,
  role: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
}).partial({
  password: true, // Make password optional for Firebase authentication
});

export const updateProfileSchema = createInsertSchema(users)
  .pick({
    firstName: true,
    lastName: true,
    bio: true,
    phone: true,
    profileImage: true,
  })
  .partial();

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateVenueSchema = createInsertSchema(venues)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
  })
  .partial();

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEventSchema = createInsertSchema(events)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
  })
  .partial();

export const insertBookingSchema = createInsertSchema(bookings)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const insertVenueBookingSchema = z.object({
  userId: z.number(),
  venueId: z.number(),
  bookingDate: z.date(),
  bookingDuration: z.number().min(1, "Booking must be at least 1 hour"),
  attendeeCount: z.number().min(1, "Must have at least 1 attendee"),
  totalAmount: z.number(),
});

export const updateBookingSchema = createInsertSchema(bookings)
  .pick({
    status: true,
    paymentStatus: true,
    ticketCount: true,
    totalAmount: true,
  })
  .partial();

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttendeeSchema = createInsertSchema(attendees).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type User = typeof users.$inferSelect;

export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type UpdateVenue = z.infer<typeof updateVenueSchema>;
export type Venue = typeof venues.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertVenueBooking = z.infer<typeof insertVenueBookingSchema>;
export type UpdateBooking = z.infer<typeof updateBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertAttendee = z.infer<typeof insertAttendeeSchema>;
export type Attendee = typeof attendees.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type EventVendor = typeof eventVendors.$inferSelect;
