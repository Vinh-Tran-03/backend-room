const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
require('dotenv').config();

async function notifyUpcomingBookings() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const now = new Date();
  const soon = new Date(now.getTime() + 15 * 60 * 1000);
  const later = new Date(now.getTime() + 16 * 60 * 1000);
  // Tìm các booking sẽ bắt đầu trong 15 phút tới (và chưa thông báo)
  const bookings = await Booking.find({
    status: 'approved',
    startTime: { $gte: soon, $lt: later }
  }).populate('teacher').populate('room');
  bookings.forEach(b => {
    // Ở đây có thể gửi email hoặc notification thực tế
    console.log(`THÔNG BÁO: Giảng viên ${b.teacher?.name} sắp đến giờ nhận phòng ${b.room?.name} (bắt đầu lúc ${b.startTime.toLocaleString()})`);
  });
  await mongoose.disconnect();
}

notifyUpcomingBookings().then(() => process.exit(0)); 