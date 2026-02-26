
const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    programName: { type: String, required: true },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },

    role: {
      type: String,
      default: 'student'
    },

    profilePic: {
      type: String,
      default: 'default.png'
    },

    deletedAt: {
      type: Date,
      default: null
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    deleteScheduledAt: { type: Date, default: null }
    
  },

  
  { timestamps: true }
)

module.exports = mongoose.model('Student', studentSchema)
