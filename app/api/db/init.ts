import { Pool } from "pg"

// Initialize PostgreSQL connection pool with Neon database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Database initialization function
export async function initializeDatabase() {
  try {
    const client = await pool.connect()
    try {
      // Create users table for storing additional user data
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          avatar_url TEXT,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)

      // Create quizzes table
      await client.query(`
        CREATE TABLE IF NOT EXISTS quizzes (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          creator_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_published BOOLEAN DEFAULT FALSE,
          cover_image TEXT,
          time_limit INTEGER,
          category VARCHAR(100),
          difficulty VARCHAR(50)
        );
      `)

      // Create questions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS questions (
          id SERIAL PRIMARY KEY,
          quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
          question_text TEXT NOT NULL,
          question_order INTEGER NOT NULL,
          question_type VARCHAR(50) DEFAULT 'multiple_choice',
          points INTEGER DEFAULT 1,
          image_url TEXT
        );
      `)

      // Create answers table
      await client.query(`
        CREATE TABLE IF NOT EXISTS answers (
          id SERIAL PRIMARY KEY,
          question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
          answer_text TEXT NOT NULL,
          is_correct BOOLEAN NOT NULL,
          explanation TEXT
        );
      `)

      // Create quiz_attempts table
      await client.query(`
        CREATE TABLE IF NOT EXISTS quiz_attempts (
          id SERIAL PRIMARY KEY,
          quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
          user_id VARCHAR(255) NOT NULL,
          score INTEGER NOT NULL,
          max_score INTEGER NOT NULL,
          time_taken INTEGER,
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)

      // Create user_answers table to track individual answers
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_answers (
          id SERIAL PRIMARY KEY,
          attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
          question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
          answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE,
          is_correct BOOLEAN NOT NULL
        );
      `)

      // Create user_stats table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_stats (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          quizzes_created INTEGER DEFAULT 0,
          quizzes_taken INTEGER DEFAULT 0,
          total_points INTEGER DEFAULT 0,
          average_score FLOAT DEFAULT 0,
          last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)

      console.log("Database initialized successfully with Neon")
    } catch (error) {
      console.error("Error initializing database:", error)
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Failed to connect to database:", error)
    // Don't throw here, just log the error
  }
}

// Database connection helper
export async function query(text: string, params?: any[]) {
  let client
  try {
    client = await pool.connect()
    return await client.query(text, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  } finally {
    if (client) client.release()
  }
}

// Function to check database connection
export async function checkConnection() {
  let client
  try {
    client = await pool.connect()
    const result = await client.query("SELECT NOW()")
    return { connected: true, timestamp: result.rows[0].now }
  } catch (error) {
    console.error("Database connection check failed:", error)
    return { connected: false, error: error.message }
  } finally {
    if (client) client.release()
  }
}

export default { initializeDatabase, query, checkConnection }
