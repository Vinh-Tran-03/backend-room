const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Lấy tất cả phòng, có lọc, search, phân trang, sắp xếp theo tầng và tên phòng
router.get('/', async (req, res) => {
  try {
    const { floor, status, search } = req.query;
    const query = {};
    if (floor) query.floor = floor;
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };
    const rooms = await Room.find(query)
      .populate('floor')
      .sort({ 'floor.name': 1, name: 1 });
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Thêm phòng (không kiểm tra trùng tên/tầng)
router.post('/', async (req, res) => {
  try {
    const { name, floor } = req.body;
    const room = new Room({ name, floor });
    await room.save();
    await room.populate('floor');
    res.json({ message: 'Room created', room });
  } catch (err) {
    console.error('Lỗi khi thêm phòng:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Xóa phòng
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Sửa tên/tầng phòng (không kiểm tra trùng tên/tầng)
router.put('/:id', async (req, res) => {
  try {
    const { name, floor } = req.body;
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { name, floor },
      { new: true }
    ).populate('floor');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room updated', room });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cập nhật trạng thái phòng (nâng cao)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, bookingEndTime } = req.body;
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status, bookingEndTime },
      { new: true }
    ).populate('floor');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room status updated', room });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// API kiểm tra phòng trống theo thời gian
router.get('/available', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ message: 'Thiếu thời gian bắt đầu/kết thúc' });
    const startTime = new Date(start);
    const endTime = new Date(end);
    // Phòng được coi là trống nếu: status === 'available' hoặc bookingEndTime < startTime
    const rooms = await Room.find({
      $or: [
        { status: 'available' },
        { bookingEndTime: { $lt: startTime } }
      ]
    }).populate('floor');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Thêm nhiều phòng (bulk add)
router.post('/bulk', async (req, res) => {
  try {
    const rooms = req.body.rooms; // [{name, floor}, ...]
    if (!Array.isArray(rooms) || rooms.length === 0) return res.status(400).json({ message: 'Danh sách phòng không hợp lệ' });
    const created = await Room.insertMany(rooms);
    res.json({ message: 'Đã thêm nhiều phòng', created });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Xóa nhiều phòng (bulk delete)
router.delete('/bulk', async (req, res) => {
  try {
    const ids = req.body.ids; // [id1, id2, ...]
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'Danh sách id không hợp lệ' });
    const result = await Room.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Đã xóa nhiều phòng', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 