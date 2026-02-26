const mongoose = require('mongoose')

const teacherSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    email: { 
      type: String, 
      unique: true, 
      required: true,
      lowercase: true,
      trim: true
    },

    password: { 
      type: String, 
      required: true 
    },

    role: {
      type: String,
      enum: ['teacher', 'admin'],
      default: 'teacher'
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },

    approvedAt: {
      type: Date,
      default: null
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: '',
      default: null
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Teacher', teacherSchema)
