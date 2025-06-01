const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'ended'], default: 'pending' }
}, { timestamps: true });
module.exports = mongoose.model('Booking', bookingSchema); 