const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
  status: { type: String, enum: ['available', 'booked'], default: 'available' },
  bookingEndTime: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema); 