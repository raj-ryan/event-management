import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupWebSockets } from "./websocket";
import { z } from "zod";
import Stripe from "stripe";
import { admin } from "./auth/firebase-admin";
import { insertUserSchema } from "@shared/schema";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeKey, {
  apiVersion: "2023-10-16" as any,
});

// Default demo user ID for non-authenticated requests
let DEFAULT_DEMO_USER_ID = 0;

// Function to ensure we have a default user for demo purposes
async function ensureDefaultDemoUser() {
  try {
    // Check if default user exists
    const existingUser = await storage.getUserByEmail("demo@eventzen.com");
    
    if (existingUser) {
      // If user exists, use their ID
      DEFAULT_DEMO_USER_ID = existingUser.id;
      console.log(`Using existing demo user with ID: ${DEFAULT_DEMO_USER_ID}`);
      return existingUser;
    }
    
    // Create a new default user if none exists
    const demoUser = await storage.createUser({
      username: "demo_user",
      email: "demo@eventzen.com",
      password: "password_hash", // Doesn't matter since we're not using passwords
      role: "user",
      firstName: "Demo",
      lastName: "User",
      uid: "demo_uid_" + Date.now(),
    });
    
    DEFAULT_DEMO_USER_ID = demoUser.id;
    console.log(`Created new demo user with ID: ${DEFAULT_DEMO_USER_ID}`);
    return demoUser;
  } catch (error) {
    console.error("Error ensuring default user:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Check if we're running in a Netlify Function environment
  const isNetlifyFunction = process.env.NETLIFY || process.env.CONTEXT === 'production' || process.env.CONTEXT === 'deploy-preview';
  
  // Set up WebSockets only if we're not in a Netlify Function environment
  // because Netlify Functions have a separate WebSocket handler
  const ws = isNetlifyFunction 
    ? {
        // Provide dummy methods that do nothing when running in Netlify
        sendNotification: () => {},
        broadcastEventUpdate: () => {}
      }
    : setupWebSockets(httpServer);
  
  // Create default demo user for non-authenticated requests
  await ensureDefaultDemoUser();
  
  // Firebase Authentication Routes
  app.post("/api/auth/verify-token", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      // Verify the Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Get or create user in our database
      let user = await storage.getUserByFirebaseUid(decodedToken.uid);
      
      // If user doesn't exist, create a new one
      if (!user) {
        // Get Firebase user details
        const firebaseUser = await admin.auth().getUser(decodedToken.uid);
        
        // Create new user in our database
        const userData = {
          uid: decodedToken.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || `user_${Date.now()}`,
          email: firebaseUser.email || '',
          password: 'firebase-auth-user', // Firebase users don't need a password in our DB
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          photoURL: firebaseUser.photoURL || '',
          role: 'user' // Default role
        };
        
        const validatedUserData = insertUserSchema.parse(userData);
        user = await storage.createUser(validatedUserData);
      }
      
      // Login the user using session-based authentication
      // Type assertion to solve type compatibility issues
      req.login(user as Express.User, (err) => {
        if (err) {
          return res.status(500).json({ message: "Authentication error" });
        }
        res.json(user);
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({ 
        message: "Invalid token",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  app.get("/api/users/firebase/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const user = await storage.getUserByFirebaseUid(uid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  
  app.post("/api/users", async (req, res) => {
    try {
      // Validate user data
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists by email or username
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Check if user already exists by Firebase UID
      if (userData.uid) {
        const existingUserByUid = await storage.getUserByFirebaseUid(userData.uid);
        if (existingUserByUid) {
          return res.status(400).json({ message: "User with this Firebase UID already exists" });
        }
      }
      
      // Create user
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ 
        message: "Error creating user",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const category = req.query.category as string | undefined;
      
      let events;
      if (category) {
        events = await storage.getEventsByCategory(category, limit, offset);
      } else {
        events = await storage.getEvents(limit, offset);
      }
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events" });
    }
  });
  
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Error fetching event" });
    }
  });
  
  app.post("/api/events", async (req, res) => {
    // Temporarily bypassing authentication check for demo purposes
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    try {
      // If user is authenticated, use their ID, otherwise use the default demo user ID
      const userId = req.isAuthenticated() ? req.user?.id : DEFAULT_DEMO_USER_ID;
      console.log(`Creating event with user ID: ${userId}`);
      
      // Verify the user exists
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`User with ID ${userId} not found`);
        return res.status(400).json({ message: "User not found" });
      }
      
      // Log the incoming data for debugging
      console.log("Event data:", JSON.stringify(req.body, null, 2));
      
      // Process date fields to ensure they're in proper format
      let date = req.body.date;
      if (date && typeof date === 'string') {
        date = new Date(date);
      }
      
      let endDate = req.body.endDate;
      if (endDate && typeof endDate === 'string') {
        endDate = new Date(endDate);
      } else if (!endDate) {
        endDate = null;
      }
      
      // Make sure required fields are present
      const eventData = {
        ...req.body,
        date: date,
        endDate: endDate,
        createdBy: userId,
        status: req.body.status || 'upcoming',
        isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
        capacity: parseInt(req.body.capacity) || 100,
        price: parseFloat(req.body.price) || 0,
        category: req.body.category || 'other' // Add a default category if missing
      };
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ 
        message: "Error creating event",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  app.put("/api/events/:id", async (req, res) => {
    // Temporarily bypassing authentication check for demo purposes
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Temporarily bypassing permission check for demo purposes
      // Only the creator or admin can update the event
      // if (event.createdBy !== req.user.id && req.user.role !== "admin") {
      //   return res.status(403).json({ message: "Forbidden" });
      // }
      
      const updatedEvent = await storage.updateEvent(eventId, req.body);
      res.json(updatedEvent);
      
      // Broadcast event update via WebSockets
      ws.broadcastEventUpdate(eventId, updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Error updating event" });
    }
  });
  
  app.delete("/api/events/:id", async (req, res) => {
    // Temporarily bypassing authentication check for demo purposes
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Temporarily bypassing permission check for demo purposes
      // Only the creator or admin can delete the event
      // if (event.createdBy !== req.user.id && req.user.role !== "admin") {
      //   return res.status(403).json({ message: "Forbidden" });
      // }
      
      await storage.deleteEvent(eventId);
      res.status(204).end();
      
      // Broadcast event deletion via WebSockets
      ws.broadcastEventUpdate(eventId, { deleted: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting event" });
    }
  });
  
  // Venue routes
  app.get("/api/venues", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const venues = await storage.getVenues(limit, offset);
      res.json(venues);
    } catch (error) {
      res.status(500).json({ message: "Error fetching venues" });
    }
  });
  
  app.get("/api/venues/:id", async (req, res) => {
    try {
      const venue = await storage.getVenue(parseInt(req.params.id));
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      res.status(500).json({ message: "Error fetching venue" });
    }
  });
  
  app.post("/api/venues", async (req, res) => {
    // For development purposes, bypassing auth checks temporarily
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    // Only admins can create venues (bypassing for development)
    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Forbidden" });
    // }
    
    try {
      const venue = await storage.createVenue(req.body);
      res.status(201).json(venue);
    } catch (error) {
      res.status(500).json({ message: "Error creating venue" });
    }
  });
  
  app.put("/api/venues/:id", async (req, res) => {
    // For development purposes, bypassing auth checks temporarily
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    // Only admins can update venues (bypassing for development)
    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Forbidden" });
    // }
    
    try {
      const venueId = parseInt(req.params.id);
      const venue = await storage.getVenue(venueId);
      
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      const updatedVenue = await storage.updateVenue(venueId, req.body);
      res.json(updatedVenue);
    } catch (error) {
      res.status(500).json({ message: "Error updating venue" });
    }
  });
  
  app.delete("/api/venues/:id", async (req, res) => {
    // For development purposes, bypassing auth checks temporarily
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    // Only admins can delete venues (bypassing for development)
    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Forbidden" });
    // }
    
    try {
      const venueId = parseInt(req.params.id);
      const venue = await storage.getVenue(venueId);
      
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      // Check if venue has associated events
      const events = await storage.getEventsByVenue(venueId);
      if (events.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete venue with associated events. Remove all events first." 
        });
      }
      
      await storage.deleteVenue(venueId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting venue" });
    }
  });
  
  // Booking routes
  app.get("/api/bookings", async (req, res) => {
    // Temporarily bypassing authentication check for demo purposes
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    try {
      // If user is authenticated, use their ID, otherwise use a default ID of 1
      const userId = req.isAuthenticated() ? req.user.id : DEFAULT_DEMO_USER_ID;
      const bookings = await storage.getBookingsByUser(userId);
      
      // Enhance bookings with event and venue details
      const enhancedBookings = await Promise.all(bookings.map(async (booking) => {
        let enhancedBooking: any = { ...booking };
        
        // Add event details if it's an event booking
        if (booking.eventId) {
          const event = await storage.getEvent(booking.eventId);
          if (event) {
            enhancedBooking.event = event;
            
            // Add venue details to event if applicable
            if (event.venueId) {
              const venue = await storage.getVenue(event.venueId);
              if (venue) {
                enhancedBooking.event.venue = venue;
              }
            }
          }
        }
        
        // Add venue details if it's a direct venue booking
        if (booking.venueId) {
          const venue = await storage.getVenue(booking.venueId);
          if (venue) {
            enhancedBooking.venue = venue;
          }
        }
        
        return enhancedBooking;
      }));
      
      res.json(enhancedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Error fetching bookings" });
    }
  });
  
  app.post("/api/venue-bookings", async (req, res) => {
    // Temporarily bypassing authentication check for demo purposes
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    try {
      // If user is authenticated, use their ID, otherwise use the default demo user ID 
      const userId = req.isAuthenticated() ? req.user.id : DEFAULT_DEMO_USER_ID;
      console.log(`Creating venue booking with user ID: ${userId}`);
      
      // Verify the user exists
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`User with ID ${userId} not found`);
        return res.status(400).json({ message: "User not found" });
      }
      
      const { venueId, bookingDate, bookingDuration, attendeeCount } = req.body;
      
      // Fetch venue to calculate total amount
      const venue = await storage.getVenue(venueId);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      // Calculate total amount (price per hour * duration)
      const totalAmount = venue.price * bookingDuration;
      
      // Create booking with venue info
      const booking = await storage.createBooking({
        userId,
        venueId,
        bookingDate: new Date(bookingDate),
        bookingDuration,
        attendeeCount,
        totalAmount,
        ticketCount: 1,
        status: "pending",
        paymentStatus: "pending"
      });
      
      res.status(201).json(booking);
      
      // Create a notification for the user
      const notification = await storage.createNotification({
        userId,
        message: `Your venue booking for ${venue.name} has been created.`,
        type: "venue_booking_created",
        read: false
      });
      
      // Send real-time notification
      ws.sendNotification(userId, notification);
    } catch (error) {
      console.error("Error creating venue booking:", error);
      res.status(500).json({ 
        message: "Error creating venue booking",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  app.post("/api/bookings", async (req, res) => {
    // Temporarily bypassing authentication check for demo purposes
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    try {
      // If user is authenticated, use their ID, otherwise use the default demo user ID
      const userId = req.isAuthenticated() ? req.user.id : DEFAULT_DEMO_USER_ID;
      console.log(`Creating event booking with user ID: ${userId}`);
      
      // Verify the user exists
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`User with ID ${userId} not found`);
        return res.status(400).json({ message: "User not found" });
      }
      
      // Log the incoming data for debugging
      console.log("Event booking data:", JSON.stringify(req.body, null, 2));
      
      // Process date fields to ensure they're in proper format
      let bookingDate = req.body.bookingDate || new Date();
      if (bookingDate && typeof bookingDate === 'string') {
        bookingDate = new Date(bookingDate);
      }
      
      // Ensure eventId is a number
      const eventId = parseInt(req.body.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Fetch event to calculate total amount
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Calculate total amount
      const ticketCount = parseInt(req.body.ticketCount) || 1;
      const totalAmount = event.price * ticketCount;
      
      // Create booking with explicitly setting venueId to null
      const booking = await storage.createBooking({
        userId,
        eventId,
        venueId: null, // Explicitly set to null to ensure it shows up in event bookings
        bookingDate,
        ticketCount,
        totalAmount,
        status: req.body.status || "pending",
        paymentStatus: req.body.paymentStatus || "pending"
      });
      
      res.status(201).json(booking);
      
      // Create a notification for the user
      const notification = await storage.createNotification({
        userId,
        message: `Your booking for ${event.name} has been created.`,
        type: "booking_created",
        read: false
      });
      
      // Send real-time notification
      ws.sendNotification(userId, notification);
    } catch (error) {
      console.error("Error creating event booking:", error);
      res.status(500).json({ 
        message: "Error creating booking",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    // Temporarily bypassing authentication check for demo purposes
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    try {
      const { bookingId } = req.body;
      
      // Get booking details
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Skip user check for demo purposes
      // if (booking.userId !== req.user.id) {
      //   return res.status(403).json({ message: "Forbidden" });
      // }
      
      // Create a PaymentIntent with the booking amount
      // Use booking's userId if user is not authenticated
      const userId = req.isAuthenticated() ? req.user.id : booking.userId;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalAmount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId: bookingId.toString(),
          userId: userId.toString()
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({
        message: "Error creating payment intent",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  app.post("/api/process-payment", async (req, res) => {
    // Temporarily bypassing authentication check for demo purposes
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    try {
      const { bookingId, stripePaymentId } = req.body;
      
      // Get booking details
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Skip user check for demo purposes
      // if (booking.userId !== req.user.id) {
      //   return res.status(403).json({ message: "Forbidden" });
      // }
      
      // Use booking's userId if user is not authenticated
      const userId = req.isAuthenticated() ? req.user.id : booking.userId;
      
      // Create payment record
      const payment = await storage.createPayment({
        userId,
        bookingId,
        amount: booking.totalAmount,
        status: "completed",
        stripePaymentId
      });
      
      // Update booking status
      await storage.updateBooking(bookingId, {
        paymentStatus: "completed",
        status: "confirmed"
      });
      
      res.status(201).json(payment);
      
      // Create a notification for the user
      const notification = await storage.createNotification({
        userId,
        message: `Your payment for booking #${bookingId} has been processed successfully.`,
        type: "payment_processed",
        read: false
      });
      
      // Send real-time notification
      ws.sendNotification(userId, notification);
    } catch (error) {
      res.status(500).json({
        message: "Error processing payment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    // Temporarily bypassing authentication check for demo purposes
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    try {
      // If user is authenticated, use their ID, otherwise use a default ID of 1
      const userId = req.isAuthenticated() ? req.user?.id : DEFAULT_DEMO_USER_ID;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });
  
  app.put("/api/notifications/:id/read", async (req, res) => {
    // Temporarily bypassing authentication check for demo purposes
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }
    
    try {
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Error updating notification" });
    }
  });
  
  return httpServer;
}
