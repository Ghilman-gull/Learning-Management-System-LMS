const env = require('dotenv').config({ debug: false });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require("http");              
const { Server } = require("socket.io");  

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb://127.0.0.1:27017/lms-data')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("registerUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("User registered with socket:", userId);
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log("User disconnected:", userId);
        break;
      }
    }
  });
});

module.exports.io = io;
module.exports.onlineUsers = onlineUsers;

const crown = require("./cron/deleteScheduledStudents");

const authRoutes = require('./routes/authroutes');
const studentRoutes = require('./routes/studentroutes');
const adminRoutes = require("./routes/adminRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running with socket on port ", PORT);
});
