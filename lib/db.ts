import { Pool } from "pg"

// Create a connection pool
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_S1rkhuoT4VqD@ep-plain-moon-a12q41hh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
})

// Test the connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err)
  } else {
    console.log("Database connected successfully at:", res.rows[0].now)
  }
})

export default pool
