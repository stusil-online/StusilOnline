const initSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join user's personal room for direct notification/messaging
    socket.on('join_personal', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${socket.id} joined personal room: user_${userId}`);
    });

    // Join a project/group room
    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(`User ${socket.id} joined project room: project_${projectId}`);
    });

    // Leave a project/group room
    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
      console.log(`User ${socket.id} left project room: project_${projectId}`);
    });

    // Realtime notification support can go here

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSockets;
