const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Teacher = require('../model/Teacher')
const Student = require('../model/Student');


const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      })
    }
    const teacherExists = await Teacher.findOne({ email })
    if (teacherExists) {
      return res.status(409).json({
        message: 'Teacher already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const teacher = await Teacher.create({
      name,
      email,
      password: hashedPassword,
      role: 'teacher',
      status: 'PENDING'
    })

    return res.status(201).json({
      message:
        'Signup successful. Your account is pending admin approval.',
      teacherId: teacher._id
    })

  } catch (error) {
    console.error('Signup Error:', error)
    return res.status(500).json({
      message: 'Signup failed'
    })
  }
}
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  let user = await Teacher.findOne({ email });
  let role = null;

  if (user) {
    role = user.role; 
  } else {
    user = await Student.findOne({ email, isDeleted: false });
    role = 'student';
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (role === 'teacher' && user.status !== 'APPROVED') {
    return res.status(403).json({ message: 'Your account is pending admin approval' });
  }

  const token = jwt.sign(
    { id: user._id, role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.status(200).json({
    message: 'Login successful',
    token,
    role,
    userId: user._id
  });
};



exports.addRoleToOldTeachers = async (req, res) => {
  try {
    const result = await Teacher.updateMany(
      { role: { $exists: false } },
      { $set: { role: "teacher" } }
    );

    res.status(200).json({
      message: "Role added to old teacher records",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("ADD ROLE ERROR:", error);
    res.status(500).json({ message: "Failed to update teachers" });
  }
};


exports.adminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await Teacher.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Teacher.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin' 
    });

    res.status(201).json({ message: 'Admin created successfully', adminId: admin._id });
  } catch (error) {
    console.error('ADMIN SIGNUP ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





