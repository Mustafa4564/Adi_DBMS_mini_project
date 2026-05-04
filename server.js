// server.js - Movie Ticket Booking System Backend
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Serve index.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'movie_booking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Database Connection
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Database Connected');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Database Connection Error:', error.message);
  });

// ============================================
// MOVIES API
// ============================================

// GET all movies
app.get('/api/movies', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [movies] = await connection.query('SELECT * FROM movies ORDER BY movie_id DESC');
    connection.release();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single movie
app.get('/api/movies/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [movies] = await connection.query('SELECT * FROM movies WHERE movie_id = ?', [req.params.id]);
    connection.release();
    if (movies.length === 0) return res.status(404).json({ error: 'Movie not found' });
    res.json(movies[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SHOWS API
// ============================================

// GET shows for a movie
app.get('/api/shows/:movieId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [shows] = await connection.query(
      `SELECT s.*, m.title, t.name as theater_name 
       FROM shows s 
       JOIN movies m ON s.movie_id = m.movie_id 
       JOIN theaters t ON s.theater_id = t.theater_id 
       WHERE s.movie_id = ? 
       ORDER BY s.show_date, s.show_time`,
      [req.params.movieId]
    );
    connection.release();
    res.json(shows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SEATS API
// ============================================

// GET seats for a show
app.get('/api/seats/:showId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [seats] = await connection.query(
      'SELECT * FROM seats WHERE show_id = ? ORDER BY seat_number',
      [req.params.showId]
    );
    connection.release();
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// BOOKINGS API
// ============================================

// CREATE booking
app.post('/api/bookings', async (req, res) => {
  const { user_id, show_id, seat_ids } = req.body;

  if (!user_id || !show_id || !seat_ids || seat_ids.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check seat availability
    const placeholders = seat_ids.map(() => '?').join(',');
    const [seatCheck] = await connection.query(
      `SELECT * FROM seats WHERE seat_id IN (${placeholders}) AND show_id = ?`,
      [...seat_ids, show_id]
    );

    for (let seat of seatCheck) {
      if (seat.is_available === 0) {
        await connection.rollback();
        return res.status(400).json({ error: `Seat ${seat.seat_number} is already booked` });
      }
    }

    // Create booking
    const bookingIds = [];
    for (let seat_id of seat_ids) {
      const [result] = await connection.query(
        'INSERT INTO bookings (user_id, show_id, seat_id, booking_date, status) VALUES (?, ?, ?, NOW(), ?)',
        [user_id, show_id, seat_id, 'confirmed']
      );
      bookingIds.push(result.insertId);

      // Update seat availability
      await connection.query(
        'UPDATE seats SET is_available = 0 WHERE seat_id = ?',
        [seat_id]
      );
    }

    await connection.commit();
    res.status(201).json({ 
      message: 'Booking successful',
      booking_ids: bookingIds,
      seat_count: seat_ids.length
    });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// GET user bookings
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [bookings] = await connection.query(
      `SELECT b.*, m.title, t.name as theater_name, s.show_time, s.show_date, se.seat_number
       FROM bookings b
       JOIN shows s ON b.show_id = s.show_id
       JOIN movies m ON s.movie_id = m.movie_id
       JOIN theaters t ON s.theater_id = t.theater_id
       JOIN seats se ON b.seat_id = se.seat_id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [req.params.userId]
    );
    connection.release();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CANCEL booking
app.delete('/api/bookings/:bookingId', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get booking details
    const [booking] = await connection.query(
      'SELECT * FROM bookings WHERE booking_id = ?',
      [req.params.bookingId]
    );

    if (booking.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Release seat
    await connection.query(
      'UPDATE seats SET is_available = 1 WHERE seat_id = ?',
      [booking[0].seat_id]
    );

    // Update booking status
    await connection.query(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      ['cancelled', req.params.bookingId]
    );

    await connection.commit();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// ============================================
// FEEDBACK API
// ============================================

// POST feedback
app.post('/api/feedback', async (req, res) => {
  const { user_id, movie_id, rating, comments } = req.body;

  if (!user_id || !movie_id || !rating) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO feedback (user_id, movie_id, rating, comments, feedback_date) VALUES (?, ?, ?, ?, NOW())',
      [user_id, movie_id, rating, comments || null]
    );
    connection.release();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET movie feedback
app.get('/api/feedback/:movieId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [feedback] = await connection.query(
      'SELECT * FROM feedback WHERE movie_id = ? ORDER BY feedback_date DESC',
      [req.params.movieId]
    );
    connection.release();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET movie average rating
app.get('/api/rating/:movieId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings FROM feedback WHERE movie_id = ?',
      [req.params.movieId]
    );
    connection.release();
    res.json({
      average_rating: result[0].average_rating ? parseFloat(result[0].average_rating).toFixed(1) : 0,
      total_ratings: result[0].total_ratings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🎬 Movie Ticket Booking System        ║
║  ✅ Server Running on Port ${PORT}       ║
║  ✅ Database Connected                 ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
