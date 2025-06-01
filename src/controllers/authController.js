const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại.' });

    const role = email.includes('@admin') ? 'admin'
              : email.includes('@teacher') ? 'teacher'
              : 'student';

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({ message: 'Đăng ký thành công. Vui lòng chờ admin chấp thuận.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email hoặc mật khẩu không hợp lệ.' });

    if (!user.approved) return res.status(403).json({ message: 'Tài khoản chưa được chấp thuận.' });
    if (!user.active) return res.status(403).json({ message: 'Tài khoản không hoạt động.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Email hoặc mật khẩu không hợp lệ.' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};