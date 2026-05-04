// setup-database.js - Movie Ticket Booking System Database Setup
const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password'
};

async function setupDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL Server');
    
    const dbName = process.env.DB_NAME || 'movie_booking';
    
    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database "${dbName}" created/exists`);
    
    // Switch to new database
    await connection.changeUser({ database: dbName });
    
    // Create Movies table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS movies (
        movie_id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        language VARCHAR(50),
        duration INT,
        release_date DATE,
        rating DECIMAL(3,1),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_title (title),
        INDEX idx_genre (genre)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Movies table created');
    
    // Create Theaters table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS theaters (
        theater_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        address TEXT,
        total_seats INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_city (city),
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Theaters table created');
    
    // Create Shows table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shows (
        show_id INT PRIMARY KEY AUTO_INCREMENT,
        movie_id INT NOT NULL,
        theater_id INT NOT NULL,
        show_time TIME NOT NULL,
        show_date DATE NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
        FOREIGN KEY (theater_id) REFERENCES theaters(theater_id) ON DELETE CASCADE,
        INDEX idx_movie (movie_id),
        INDEX idx_theater (theater_id),
        INDEX idx_date (show_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Shows table created');
    
    // Create Seats table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS seats (
        seat_id INT PRIMARY KEY AUTO_INCREMENT,
        show_id INT NOT NULL,
        seat_number VARCHAR(10) NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE CASCADE,
        INDEX idx_show (show_id),
        UNIQUE KEY unique_seat (show_id, seat_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Seats table created');
    
    // Create Bookings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        booking_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        show_id INT NOT NULL,
        seat_id INT NOT NULL,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
        FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE CASCADE,
        FOREIGN KEY (seat_id) REFERENCES seats(seat_id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_show (show_id),
        INDEX idx_status (status),
        INDEX idx_date (booking_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Bookings table created');
    
    // Create Feedback table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        feedback_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        movie_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comments TEXT,
        feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
        INDEX idx_movie (movie_id),
        INDEX idx_user (user_id),
        INDEX idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Feedback table created');
    
    // Insert sample data
    console.log('\n📥 Inserting sample data...\n');
    
    // Sample movies
    await connection.query(`
      INSERT IGNORE INTO movies (title, genre, language, duration, release_date, rating, description) VALUES
      ('Inception', 'Sci-Fi', 'English', 148, '2010-07-16', 4.5, 'A mind-bending sci-fi thriller'),
      ('The Dark Knight', 'Action', 'English', 152, '2008-07-18', 4.8, 'Batman faces his greatest challenge'),
      ('Interstellar', 'Sci-Fi', 'English', 169, '2014-11-07', 4.7, 'Journey through space and time'),
      ('Avengers', 'Action', 'English', 143, '2012-05-04', 4.4, 'Earth\\'s mightiest heroes assemble'),
      ('The Shawshank Redemption', 'Drama', 'English', 142, '1994-10-14', 4.9, 'A prison drama masterpiece')
    `);
    console.log('✅ Sample movies inserted');
    
    // Sample theaters
    await connection.query(`
      INSERT IGNORE INTO theaters (name, city, address, total_seats) VALUES
      ('PVR Cinema', 'Mumbai', '123 Marine Drive, Mumbai', 300),
      ('IMAX Theater', 'Delhi', '456 Connaught Place, Delhi', 250),
      ('Cineplex Hall', 'Bangalore', '789 MG Road, Bangalore', 280),
      ('Multiplex Deluxe', 'Pune', '321 Oswald Street, Pune', 200),
      ('Grand Cinema', 'Hyderabad', '654 Hitech City, Hyderabad', 320)
    `);
    console.log('✅ Sample theaters inserted');
    
    // Sample shows
    await connection.query(`
      INSERT IGNORE INTO shows (movie_id, theater_id, show_time, show_date, price) VALUES
      (1, 1, '10:00:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 300),
      (1, 1, '14:00:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 300),
      (1, 1, '18:00:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 400),
      (2, 2, '11:00:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 350),
      (2, 2, '19:00:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 450),
      (3, 3, '12:00:00', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 320),
      (4, 4, '17:00:00', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 380),
      (5, 5, '09:00:00', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 250)
    `);
    console.log('✅ Sample shows inserted');
    
    // Generate seats for first show
    const [shows] = await connection.query('SELECT show_id FROM shows LIMIT 8');
    
    for (let show of shows) {
      const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
      const cols = Array.from({length: 10}, (_, i) => i + 1);
      
      for (let row of rows) {
        for (let col of cols) {
          await connection.query(
            'INSERT IGNORE INTO seats (show_id, seat_number, is_available) VALUES (?, ?, TRUE)',
            [show.show_id, `${row}${col}`]
          );
        }
      }
    }
    console.log('✅ Sample seats generated');
    
    await connection.end();
    
    console.log(`
╔══════════════════════════════════════════╗
║  ✅ DATABASE SETUP COMPLETED             ║
╚══════════════════════════════════════════╝

Database: movie_booking
Tables Created:
  • movies (5 sample movies)
  • theaters (5 sample theaters)
  • shows (8 sample shows)
  • seats (auto-generated for all shows)
  • bookings
  • feedback

Sample Data: ✅ Inserted

You can now run: npm start
    `);
    
  } catch (error) {
    console.error('❌ Setup Error:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
