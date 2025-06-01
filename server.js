const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

// Routes (sẽ thêm sau)
app.get('/', (req, res) => {
  res.send('API is running...');
});
// Import routes
app.use(cors({ origin: ['http://localhost:5173', 'https://frontend-room-delta.vercel.app'],
  credentials: true 
}));

const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

const roomRoutes = require('./src/routes/roomRoutes');
app.use('/api/rooms', roomRoutes);

const floorRoutes = require('./src/routes/floorRoutes');
app.use('/api/floors', floorRoutes);

const bookingRoutes = require('./src/routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
