const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const mongoose = require('mongoose');

// Lấy danh sách booking chờ duyệt
router.get('/pending', async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .populate('room')
      .populate('teacher');
    res.json(bookings.map(b => ({
      id: b._id,
      roomName: b.room?.name,
      teacherName: b.teacher?.name,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Phê duyệt booking
router.post('/approve/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    // Cập nhật trạng thái phòng
    await Room.findByIdAndUpdate(booking.room, { status: 'booked', bookingEndTime: booking.endTime });
    res.json({ message: 'Phê duyệt thành công! Thông báo đã được gửi đến giảng viên.', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Từ chối booking
router.post('/reject/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking rejected', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Tạo booking mới
router.post('/', async (req, res) => {
  try {
    const { room, teacher, startTime, endTime } = req.body;
    // Kiểm tra dữ liệu đầu vào
    if (!room || !teacher || !startTime || !endTime) {
      return res.status(400).json({ message: 'Thiếu thông tin đặt phòng!' });
    }
    if (!mongoose.Types.ObjectId.isValid(room) || !mongoose.Types.ObjectId.isValid(teacher)) {
      return res.status(400).json({ message: 'Phòng hoặc người đặt không hợp lệ!' });
    }
    // Kiểm tra trùng lịch
    const conflict = await Booking.findOne({
      room,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });
    if (conflict) return res.status(400).json({ message: 'Phòng đã có lịch đặt trùng thời gian này.' });
    const booking = new Booking({ room, teacher, startTime, endTime });
    await booking.save();
    res.json({ message: 'Booking created', booking });
  } catch (err) {
    console.error('Lỗi khi tạo booking:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Lấy lịch sử booking
router.get('/history', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room')
      .populate('teacher');
    res.json(bookings.map(b => ({
      id: b._id,
      roomName: b.room?.name,
      teacherName: b.teacher?.name,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 