import { db, pool } from "../server/db";
import { 
  users, venues, events, bookings, attendees, vendors, eventVendors, 
  notifications, payments 
} from "../shared/schema";

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(payments);
  await db.delete(notifications);
  await db.delete(eventVendors);
  await db.delete(attendees);
  await db.delete(bookings);
  await db.delete(events);
  await db.delete(vendors);
  await db.delete(venues);
  await db.delete(users);

  console.log("Database cleared. Inserting seed data...");

  // Insert users
  const [admin, user1, user2] = await db.insert(users).values([
    {
      username: "admin",
      email: "admin@eventzen.com",
      password: "$2b$10$hsEJp.ZUF5Xb5.JUu6Ujm.DF9lLKQyEL1EFr3h3xO0CGP3yOqUPNi", // admin123
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      createdAt: new Date()
    },
    {
      username: "johndoe",
      email: "john@example.com",
      password: "$2b$10$hsEJp.ZUF5Xb5.JUu6Ujm.DF9lLKQyEL1EFr3h3xO0CGP3yOqUPNi", // admin123
      firstName: "John",
      lastName: "Doe",
      role: "user",
      createdAt: new Date()
    },
    {
      username: "janesmith",
      email: "jane@example.com",
      password: "$2b$10$hsEJp.ZUF5Xb5.JUu6Ujm.DF9lLKQyEL1EFr3h3xO0CGP3yOqUPNi", // admin123
      firstName: "Jane",
      lastName: "Smith",
      role: "user",
      createdAt: new Date()
    }
  ]).returning();

  console.log("Users created:", admin.id, user1.id, user2.id);

  // Insert venues
  const [venue1, venue2, venue3] = await db.insert(venues).values([
    {
      name: "Grand Ballroom",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      capacity: 500,
      price: 2000,
      amenities: ["Wi-Fi", "Sound System", "Catering", "Stage", "Parking"],
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2798&auto=format&fit=crop",
      description: "Elegant ballroom perfect for large events, weddings, and corporate functions."
    },
    {
      name: "Garden Pavilion",
      address: "456 Park Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      capacity: 200,
      price: 1500,
      amenities: ["Outdoor Space", "Garden", "Tent", "Bar Service", "Lighting"],
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2728&auto=format&fit=crop",
      description: "Beautiful outdoor venue surrounded by gardens and natural scenery."
    },
    {
      name: "Tech Conference Center",
      address: "789 Bay St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
      capacity: 300,
      price: 3000,
      amenities: ["High-Speed Internet", "AV Equipment", "Conference Rooms", "Whiteboards", "Breakout Areas"],
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2728&auto=format&fit=crop",
      description: "Modern conference space with cutting-edge technology for business events."
    }
  ]).returning();

  console.log("Venues created:", venue1.id, venue2.id, venue3.id);

  // Insert vendors
  const [vendor1, vendor2, vendor3, vendor4] = await db.insert(vendors).values([
    {
      name: "Elite Catering",
      email: "contact@elitecatering.com",
      phone: "212-555-1234",
      serviceType: "Catering",
      description: "Premium catering service for all types of events."
    },
    {
      name: "Sound Masters",
      email: "info@soundmasters.com",
      phone: "415-555-6789",
      serviceType: "Audio/Visual",
      description: "Professional audio and visual equipment and services."
    },
    {
      name: "Perfect Decor",
      email: "hello@perfectdecor.com",
      phone: "310-555-4321",
      serviceType: "Decoration",
      description: "Event decoration and ambiance specialists."
    },
    {
      name: "Photo Memories",
      email: "bookings@photomemories.com",
      phone: "650-555-7890",
      serviceType: "Photography",
      description: "Capturing your special moments with professional photography."
    }
  ]).returning();

  console.log("Vendors created:", vendor1.id, vendor2.id, vendor3.id, vendor4.id);

  // Insert events
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  const twoMonthsFromNow = new Date();
  twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

  const [event1, event2, event3] = await db.insert(events).values([
    {
      name: "Annual Tech Conference",
      description: "Join us for the biggest tech conference of the year!",
      date: twoWeeksFromNow,
      endDate: new Date(twoWeeksFromNow.getTime() + 9 * 60 * 60 * 1000),
      category: "Conference",
      venueId: venue3.id,
      capacity: 250,
      price: 150,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2740&auto=format&fit=crop",
      status: "upcoming",
      createdBy: admin.id
    },
    {
      name: "Summer Wedding Showcase",
      description: "Explore the latest wedding trends and meet top vendors.",
      date: oneMonthFromNow,
      endDate: new Date(oneMonthFromNow.getTime() + 6 * 60 * 60 * 1000),
      category: "Expo",
      venueId: venue1.id,
      capacity: 400,
      price: 50,
      image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2670&auto=format&fit=crop",
      status: "upcoming",
      createdBy: admin.id
    },
    {
      name: "Garden Concert Series",
      description: "An evening of live music in our beautiful garden setting.",
      date: twoMonthsFromNow,
      endDate: new Date(twoMonthsFromNow.getTime() + 3 * 60 * 60 * 1000),
      category: "Concert",
      venueId: venue2.id,
      capacity: 180,
      price: 75,
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2740&auto=format&fit=crop",
      status: "upcoming",
      createdBy: admin.id
    }
  ]).returning();

  console.log("Events created:", event1.id, event2.id, event3.id);

  // Link vendors to events
  await db.insert(eventVendors).values([
    { eventId: event1.id, vendorId: vendor2.id },
    { eventId: event1.id, vendorId: vendor4.id },
    { eventId: event2.id, vendorId: vendor1.id },
    { eventId: event2.id, vendorId: vendor3.id },
    { eventId: event2.id, vendorId: vendor4.id },
    { eventId: event3.id, vendorId: vendor1.id },
    { eventId: event3.id, vendorId: vendor2.id }
  ]);

  console.log("Vendors linked to events");

  // Create some bookings
  const [booking1, booking2] = await db.insert(bookings).values([
    {
      userId: user1.id,
      eventId: event1.id,
      ticketCount: 2,
      totalAmount: 300, // 2 * 150
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: new Date()
    },
    {
      userId: user2.id,
      eventId: event2.id,
      ticketCount: 1,
      totalAmount: 50, // 1 * 50
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: new Date()
    }
  ]).returning();

  console.log("Bookings created:", booking1.id, booking2.id);

  // Create attendees for these bookings
  await db.insert(attendees).values([
    {
      bookingId: booking1.id,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890"
    },
    {
      bookingId: booking1.id,
      firstName: "Sarah",
      lastName: "Doe",
      email: "sarah@example.com",
      phone: "123-456-7891"
    },
    {
      bookingId: booking2.id,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "123-456-7892"
    }
  ]);

  console.log("Attendees created");

  // Create payments for these bookings
  await db.insert(payments).values([
    {
      userId: user1.id,
      bookingId: booking1.id,
      amount: 300,
      status: "completed",
      stripePaymentId: "mock_stripe_id_1",
      createdAt: new Date()
    },
    {
      userId: user2.id,
      bookingId: booking2.id,
      amount: 50,
      status: "completed",
      stripePaymentId: "mock_stripe_id_2",
      createdAt: new Date()
    }
  ]);

  console.log("Payments created");

  // Create notifications
  await db.insert(notifications).values([
    {
      userId: user1.id,
      message: "Your booking for Annual Tech Conference has been confirmed.",
      type: "success",
      read: false,
      createdAt: new Date()
    },
    {
      userId: user2.id,
      message: "Your booking for Summer Wedding Showcase has been confirmed.",
      type: "success",
      read: false,
      createdAt: new Date()
    },
    {
      userId: user1.id,
      message: "Annual Tech Conference starts in 2 weeks.",
      type: "info",
      read: false,
      createdAt: new Date()
    }
  ]);

  console.log("Notifications created");

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Disconnecting from database...");
    await pool.end();
    process.exit(0);
  });