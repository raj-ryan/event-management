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

async function setupDatabase() {
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
    
    // Read the migration file
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations.sql'),
      'utf8'
    );
    
    // Execute the migration
    console.log('Creating database tables...');
    await pool.query(migrationSQL);
    
    console.log('Database tables created successfully');
    
    // Create a default admin user if it doesn't exist
    console.log('Creating default admin user...');
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, role, first_name, last_name)
       VALUES ('admin', 'admin@eventzen.com', 'admin', 'Admin', 'User')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`
    );
    
    if (rows.length > 0) {
      console.log('Default admin user created with ID:', rows[0].id);
    } else {
      console.log('Default admin user already exists');
    }
    
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase().catch(console.error); 