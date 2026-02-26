const { io, onlineUsers } = require("../index"); 
const Student = require("../model/Student");
const Teacher = require("../model/Teacher")
const nodemailer = require('nodemailer')
const deleteNow = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({
        message: "No students selected"
      });
    }

    await Student.updateMany(
      { _id: { $in: studentIds }, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date()
        }
      }
    );

    studentIds.forEach((studentId) => {
      const socketId = onlineUsers.get(studentId.toString());

      if (socketId) {
        io.to(socketId).emit("forceLogout", {
          message: "You are deleted by admin"
        });
      }
    });

    res.status(200).json({
      message: "Student(s) deleted successfully"
    });

  } catch (error) {
    console.error("Delete Now Error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


const scheduleDelete = async (req, res) => {
  try {
    const { studentIds, delayType, delayValue } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "No students selected" });
    }

    if (!["seconds","minutes","hours"].includes(delayType)) {
      return res.status(400).json({ message: "Invalid delay type" });
    }

    const now = new Date();
    const deleteAt = new Date(now);

    if (delayType === "seconds") deleteAt.setSeconds(now.getSeconds() + Number(delayValue));
    if (delayType === "minutes") deleteAt.setMinutes(now.getMinutes() + Number(delayValue));
    if (delayType === "hours") deleteAt.setHours(now.getHours() + Number(delayValue));

    await Student.updateMany(
      { _id: { $in: studentIds } },
      {
        $set: {
          deleteScheduledAt: deleteAt, 
          isDeleted: false             
        }
      }
    );

    return res.status(200).json({ message: "Deletion scheduled successfully" });

  } catch (error) {
    console.error("Schedule Delete Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const getPendingTeachers = async (req, res) => {
  try {
    const { email, id } = req.query
    let filter = { status: 'PENDING' }

    if (email) filter.email = email
    if (id) filter._id = id

    const teachers = await Teacher.find(filter).select('-password')
    return res.status(200).json(teachers)
  } catch (error) {
    console.error('Error fetching pending teachers:', error)
    return res.status(500).json({ message: 'Failed to fetch teachers' })
  }
}

const approveTeacher = async (req, res) => {
  try {
    const { id } = req.params

    const teacher = await Teacher.findById(id)
    if (!teacher || teacher.status !== 'PENDING') {
      return res.status(404).json({ message: 'Teacher not found or already approved' })
    }

    teacher.status = 'APPROVED'
    teacher.approvedAt = new Date()
    teacher.approvedBy = req.admin._id
    await teacher.save()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: teacher.email,
      subject: 'Your Teacher Account Has Been Approved',
      text: `Hello ${teacher.name},\n\nYour account has been approved. You can now log in.\n\nRegards,\nAdmin Team`
    })

    return res.status(200).json({ message: 'Teacher approved and notified' })
  } catch (error) {
    console.error('Approve Teacher Error:', error)
    return res.status(500).json({ message: 'Approval failed' })
  }
}
module.exports = { deleteNow, scheduleDelete ,getPendingTeachers, approveTeacher };
