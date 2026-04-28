const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Track online users
const onlineUsers = new Map(); // userId -> socketId

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    io.emit('user_status', Array.from(onlineUsers.keys()));
    console.log(`User ${userId} joined their room.`);
  });

  socket.on('send_message', async (data) => {
    // Expected: { receiver, senderId, text, attachment, attachmentType }
    try {
      // Prevent self-messaging
      if (data.senderId?.toString() === data.receiver?.toString()) return;

      const Message = require('./models/Message');
      
      const newMessage = new Message({
        senderId: data.senderId,
        receiverId: data.receiver,
        message: data.text || '',
        attachment: data.attachment,
        attachmentType: data.attachmentType
      });
      await newMessage.save();

      const formatted = {
        _id: newMessage._id,
        sender: newMessage.senderId.toString(),
        receiver: newMessage.receiverId.toString(),
        text: newMessage.message,
        attachment: newMessage.attachment,
        attachmentType: newMessage.attachmentType,
        createdAt: newMessage.createdAt,
      };

      // Emit to receiver
      io.to(data.receiver).emit('receive_message', formatted);
      // Emit back to sender for confirmation
      socket.emit('receive_message', formatted);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('delete_message', (data) => {
    // data = { messageId, receiverId, type }
    io.to(data.receiverId).emit('message_deleted', data);
  });

  // Legacy socket event support
  socket.on('sendMessage', async (data) => {
    try {
      const Message = require('./models/Message');
      const newMessage = new Message({
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
      });
      await newMessage.save();
      io.to(data.receiverId).emit('receiveMessage', newMessage);
      socket.emit('messageSent', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    // Remove from online users
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('user_status', Array.from(onlineUsers.keys()));
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/recruiters', require('./routes/recruiterRoutes'));
app.use('/api/recruiter', require('./routes/recruiterRoutes')); // legacy alias
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academic-curator';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
