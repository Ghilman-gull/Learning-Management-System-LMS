const cron = require("node-cron");
const Student = require("../model/Student");
const { io, onlineUsers } = require("../index"); 

console.log("Cron job for scheduled student deletion started.");

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const studentsToDelete = await Student.find({
      deleteScheduledAt: { $lte: now },
      isDeleted: false
    });

    for (let student of studentsToDelete) {
      student.isDeleted = true;
      student.deletedAt = now;
      student.deleteScheduledAt = null;
      await student.save();

      const socketId = onlineUsers.get(student._id.toString());

      if (socketId) {
        io.to(socketId).emit("forceLogout", {
          message: "Your account has been removed by admin"
        });
      }
    }

    if (studentsToDelete.length > 0) {
      console.log(`Soft-deleted ${studentsToDelete.length} scheduled student(s) at ${now}`);
    }

  } catch (err) {
    console.error("Cron job error:", err);
  }
});