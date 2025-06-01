const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Lấy danh sách user chờ duyệt (approved: false)
router.get('/pending', async (req, res) => {
  try {
    const pendingUsers = await User.find({ approved: false });
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Phê duyệt user
router.post('/approve/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User approved', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Từ chối user (xóa khỏi DB)
router.post('/reject/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User rejected and deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Lấy tất cả user đã duyệt
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ approved: true });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Xóa user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Người dùng đã xóa' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Cập nhật tên user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Người dùng đã cập nhật', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router; 