# 🎬 Movie Ticket Booking System

A complete online movie ticket booking system with real-time seat selection, booking management, and customer feedback collection.

## 🎯 Features

✅ **Movie Listings** - Browse all available movies with details
✅ **Show Management** - View shows with different timings and theaters  
✅ **Real-time Seat Availability** - Visual seat map showing available/booked seats
✅ **Seat Selection** - Select preferred seats before booking
✅ **Ticket Booking** - Complete booking with confirmation
✅ **Ticket Cancellation** - Cancel bookings and release seats
✅ **Customer Feedback** - Rate movies and share reviews
✅ **Booking History** - View all past bookings
✅ **Responsive Design** - Works on all devices

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL 5.7+
- **API**: RESTful Architecture

## 📋 Prerequisites

- Node.js 14+ 
- MySQL 5.7+
- npm (Node Package Manager)

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- express (web framework)
- mysql2 (database driver)
- cors (cross-origin support)
- dotenv (environment variables)

### Step 2: Configure Database

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=movie_booking
PORT=5000
NODE_ENV=development
```

### Step 3: Setup Database & Tables

Run the setup script:

```bash
node setup-database.js
```

This will:
- Create the `movie_booking` database
- Create all tables (movies, theaters, shows, seats, bookings, feedback)
- Insert sample data

### Step 4: Start the Server

```bash
npm start
```

The server will start on `http://localhost:5000`

### Step 5: Access the Application

Open in your browser:

```
http://localhost:5000
```

## 📡 API Endpoints

### Movies
```
GET /api/movies                    - Get all movies
GET /api/movies/:id               - Get single movie
```

### Shows
```
GET /api/shows/:movieId           - Get shows for a movie
```

### Seats
```
GET /api/seats/:showId            - Get seats for a show
```

### Bookings
```
POST /api/bookings                - Create booking
GET /api/bookings/user/:userId    - Get user bookings
DELETE /api/bookings/:bookingId   - Cancel booking
```

### Feedback
```
POST /api/feedback                - Submit feedback/rating
GET /api/feedback/:movieId        - Get movie feedback
GET /api/rating/:movieId          - Get average rating
```

## 🗄️ Database Schema

### Movies Table
- movie_id (PK)
- title
- genre
- language
- duration
- release_date
- rating
- description

### Theaters Table
- theater_id (PK)
- name
- city
- address
- total_seats

### Shows Table
- show_id (PK)
- movie_id (FK)
- theater_id (FK)
- show_time
- show_date
- price

### Seats Table
- seat_id (PK)
- show_id (FK)
- seat_number
- is_available

### Bookings Table
- booking_id (PK)
- user_id
- show_id (FK)
- seat_id (FK)
- booking_date
- status (confirmed/cancelled)

### Feedback Table
- feedback_id (PK)
- user_id
- movie_id (FK)
- rating (1-5)
- comments
- feedback_date

## 📁 Project Structure

```
movie-ticket-booking-system/
├── server.js              # Express server & API
├── setup-database.js      # Database initialization
├── index.html             # Frontend application
├── package.json           # Dependencies
├── .env.example          # Environment template
├── .env                  # Actual env (create this)
├── .gitignore            # Git configuration
└── README.md             # This file
```

## 🎮 Usage

### Booking a Ticket

1. **Browse Movies** - Click on a movie to see available shows
2. **Select Show** - Choose your preferred show timing and theater
3. **Choose Seats** - Click seats to select them (green = available, gray = booked)
4. **Confirm Booking** - Click "Confirm Booking" to complete purchase
5. **View Confirmation** - Check "My Bookings" tab for confirmation

### Cancelling a Booking

1. Go to **"My Bookings"** tab
2. Find the booking you want to cancel
3. Click **"Cancel"** button
4. Confirm cancellation

### Providing Feedback

1. Go to **"My Bookings"** tab
2. Click **"Rate"** button on a confirmed booking
3. Select rating (1-5 stars)
4. Add optional comments
5. Click **"Submit Feedback"**

## 🔒 Security Features

✅ Prepared statements (prevent SQL injection)
✅ Input validation on backend
✅ Transaction management for bookings
✅ Seat availability verification
✅ CORS protection
✅ Error handling

## 🌐 Deployment to GitHub Pages

This project can be deployed on GitHub Pages for the frontend.

### Steps:

1. Create a GitHub repository
2. Push all files to main branch
3. In GitHub Settings, enable GitHub Pages
4. Select `main` branch as source
5. Site will be available at: `https://username.github.io/movie-ticket-booking-system/`

**Note**: The backend API needs separate hosting (Heroku, AWS, etc.)

## 🚀 Production Deployment

For production:

1. Use environment variables for sensitive data
2. Enable HTTPS
3. Use process manager (PM2)
4. Setup database backups
5. Monitor logs and errors
6. Scale database with proper indexing

## 🐛 Troubleshooting

### "Connection refused" Error
```
Check if MySQL is running:
Windows: Services → MySQL
Linux: sudo systemctl status mysql
Mac: brew services list
```

### "Database does not exist"
```
Run setup script again:
node setup-database.js
```

### "Module not found"
```
Reinstall dependencies:
npm install
```

### Port 5000 Already in Use
```
Change PORT in .env or:
Windows: netstat -ano | findstr :5000
Linux/Mac: lsof -i :5000
```

## 📊 Sample Data

The system comes with:
- 5 sample movies
- 5 sample theaters
- 8 sample shows
- 60 seats per show (6 rows × 10 columns)

## 🎓 Learning Concepts

This project demonstrates:
- Full-stack web development
- Database design and relationships
- RESTful API development
- Real-time seat management
- Transaction handling
- Frontend-backend integration
- Responsive design
- User authentication concepts

## 📝 License

MIT License - Feel free to use and modify

## 👥 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review database schema
- Check API endpoint documentation
- Review browser console for errors
- Check server logs

## 🎊 Getting Started

```bash
# Clone project
git clone https://github.com/yourusername/movie-ticket-booking.git
cd movie-ticket-booking

# Setup
npm install
node setup-database.js

# Start
npm start

# Open in browser
http://localhost:5000
```

---

**Happy booking! 🎬🍿**

Version: 1.0.0  
Created: 2025-26  
Department: AI & DS
