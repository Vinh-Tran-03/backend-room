const express = require('express');
const router = express.Router();
const Floor = require('../models/Floor');

// Lấy tất cả tầng
router.get('/', async (req, res) => {
  try {
    const floors = await Floor.find().sort({ name: 1 });
    res.json({ floors });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Thêm tầng
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên tầng là bắt buộc' });
    const existed = await Floor.findOne({ name });
    if (existed) return res.status(400).json({ message: 'Tầng đã tồn tại' });
    const floor = new Floor({ name });
    await floor.save();
    res.json({ message: 'Đã thêm tầng', floor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Sửa tầng
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const existed = await Floor.findOne({ name, _id: { $ne: req.params.id } });
    if (existed) return res.status(400).json({ message: 'Tầng đã tồn tại' });
    const floor = await Floor.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!floor) return res.status(404).json({ message: 'Không tìm thấy tầng' });
    res.json({ message: 'Đã cập nhật tầng', floor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Xóa tầng
router.delete('/:id', async (req, res) => {
  try {
    const floor = await Floor.findByIdAndDelete(req.params.id);
    if (!floor) return res.status(404).json({ message: 'Không tìm thấy tầng' });
    res.json({ message: 'Đã xóa tầng' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 