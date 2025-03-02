require("dotenv").config();
const { Pool } = require("pg");

// Cấu hình kết nối
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});


module.exports = pool;
