import { Pool, neonConfig } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import ws from 'ws';

// Configure Neon to use the WebSocket constructor
neonConfig.webSocketConstructor = ws;

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

async function seedData() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in environment variables');
    process.exit(1);
  }
  
  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Test connection
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('Database connection successful!');
    
    // First, check if we have any users
    console.log('Checking for existing users...');
    const existingUsersResult = await pool.query('SELECT * FROM users');
    
    let adminId: number;
    
    if (existingUsersResult.rows.length > 0) {
      // Use the first user as the admin
      adminId = existingUsersResult.rows[0].id;
      console.log(`Using existing user with ID: ${adminId} as admin`);
    } else {
      // Create a default admin user if none exists
      console.log('Creating default admin user...');
      const adminResult = await pool.query(`
        INSERT INTO users (username, email, role, first_name, last_name, firebase_uid)
        VALUES ('admin', 'admin@eventzen.com', 'admin', 'Admin', 'User', 'admin_uid_${Date.now()}')
        RETURNING id
      `);
      
      adminId = adminResult.rows[0].id;
      console.log(`Created new admin user with ID: ${adminId}`);
    }
    
    // Create sample venues
    console.log('Creating sample venues...');
    const venueResult = await pool.query(`
      INSERT INTO venues (name, address, city, state, zip_code, capacity, amenities, price, description, created_by, image)
      VALUES 
        ('Grand Ballroom', '123 Main St', 'New York', 'NY', '10001', 500, ARRAY['Wi-Fi', 'Catering', 'Sound System'], 1200, 'Luxurious ballroom for elegant events', ${adminId}, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3'),
        ('Tech Hub', '456 Innovation Ave', 'San Francisco', 'CA', '94103', 200, ARRAY['Wi-Fi', 'Projector', 'Whiteboard'], 800, 'Modern space for tech meetups and conferences', ${adminId}, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3'),
        ('Garden Pavilion', '789 Park Rd', 'Chicago', 'IL', '60601', 150, ARRAY['Outdoor Space', 'Lighting', 'Furniture'], 950, 'Beautiful outdoor venue with stunning garden views', ${adminId}, 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    
    // Collect venue IDs
    const venueIds = venueResult.rows.map(row => row.id);
    console.log(`Created/found ${venueIds.length} venues`);
    
    if (venueIds.length === 0) {
      // Fetch existing venues if none were inserted (due to conflict)
      console.log('Fetching existing venues...');
      const existingVenues = await pool.query(`SELECT id FROM venues LIMIT 3`);
      venueIds.push(...existingVenues.rows.map(row => row.id));
      console.log(`Found ${venueIds.length} existing venues`);
    }
    
    // Create sample events
    console.log('Creating sample events...');
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 30);
    
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 45);
    
    const futureDate3 = new Date();
    futureDate3.setDate(futureDate3.getDate() + 60);
    
    if (venueIds.length > 0) {
      await pool.query(`
        INSERT INTO events (name, description, date, end_date, venue_id, capacity, price, category, created_by, status, is_published, image)
        VALUES 
          ('Annual Tech Conference', 'Join us for the biggest tech event of the year!', $1, $2, $3, 200, 75, 'Technology', ${adminId}, 'upcoming', true, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3'),
          ('Summer Wedding Showcase', 'Discover the latest wedding trends and meet top vendors', $4, $5, $6, 150, 25, 'Wedding', ${adminId}, 'upcoming', true, 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3'),
          ('Business Leadership Summit', 'Learn from industry leaders and network with professionals', $7, $8, $9, 100, 150, 'Business', ${adminId}, 'upcoming', true, 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3')
        ON CONFLICT DO NOTHING
      `, [
        futureDate1.toISOString(), 
        new Date(futureDate1.getTime() + 3 * 60 * 60 * 1000).toISOString(), // +3 hours
        venueIds[0] || 1,
        futureDate2.toISOString(),
        new Date(futureDate2.getTime() + 6 * 60 * 60 * 1000).toISOString(), // +6 hours
        venueIds[1] || 1,
        futureDate3.toISOString(),
        new Date(futureDate3.getTime() + 8 * 60 * 60 * 1000).toISOString(), // +8 hours
        venueIds[2] || 1
      ]);
      console.log('Created sample events');
    }
    
    // Create sample vendors
    console.log('Creating sample vendors...');
    await pool.query(`
      INSERT INTO vendors (name, email, phone, service_type, description)
      VALUES 
        ('Premium Catering', 'info@premiumcatering.com', '555-123-4567', 'Catering', 'High-end catering service for all types of events'),
        ('Sound Solutions', 'contact@soundsolutions.com', '555-987-6543', 'Audio/Visual', 'Professional sound and lighting equipment'),
        ('Floral Designs', 'hello@floraldesigns.com', '555-456-7890', 'Decoration', 'Beautiful floral arrangements for any occasion')
      ON CONFLICT DO NOTHING
    `);
    console.log('Created sample vendors');
    
    console.log('Sample data created successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedData().catch(console.error); 