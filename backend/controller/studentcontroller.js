const Student = require('../model/Student')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const generateRandomPassword = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

exports.addStudent = async (req, res) => {
  try {
    const { name, email, programName } = req.body

    if (!name || !email || !programName) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const plainPassword = generateRandomPassword()

    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      programName,
      teacherId: req.user.id
    })

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your LMS Login Credentials',
      html: `
        <h2>Hello ${name}</h2>
        <p>Your student account has been created.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${plainPassword}</p>
        <p><strong>Program:</strong> ${programName}</p>
        <p>Please login and change your password immediately.</p>
      `
    })

    res.status(201).json({
      message: 'Student added successfully and credentials sent via email'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Failed to add student',
      error: error.message
    })
  }
}

exports.getMyStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 5
    const skip = (page - 1) * limit
    const search = req.query.search || ''

    const query = { teacherId: req.user.id }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const totalStudents = await Student.countDocuments({ teacherId: req.user.id }) 

    const filteredCount = await Student.countDocuments(query) 

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password')

    res.status(200).json({
      message: 'Students fetched successfully',
      students,
      totalStudents, 
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredCount / limit)
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Failed to fetch students',
      error: error.message
    })
  }
}
exports.studentLogin = async (req, res) => {
  const { email, password } = req.body

  try {
    const student = await Student.findOne({ email })
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, student.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      token,
      role: 'student',
      studentId: student._id
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: ' error' })
  }
}

exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id

    const student = await Student.findById(studentId)
      .populate('teacherId', 'name')

    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    res.json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        programName: student.programName,
        teacherName: student.teacherId.name,
        profilePic: student.profilePic
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}


exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' })
    }
    const student = await Student.findById(req.user.id)

    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    student.profilePic = req.file.filename
    await student.save()

    res.status(200).json({
      message: 'Profile picture updated successfully',
      profilePic: student.profilePic
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Profile image upload failed' })
  }
}

exports.getAllStudentsForAdmin = async (req, res) => {
  try {
    const students = await Student.find({
      isDeleted: false
    })
      .populate('teacherId', 'name email')

    res.status(200).json(students)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch students' })
  }
}

