// const { Pool } = require('pg');
// const dotenv = require('dotenv');
import pg from 'pg';
import dotenv from "dotenv";
dotenv.config(); 

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Set this in your environment variables
  ssl:false,
});

// Check the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully:', res.rows[0].now);
  }
});

export default {
  query: (text, params) => pool.query(text, params),
};
