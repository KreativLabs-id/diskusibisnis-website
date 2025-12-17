import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import config from '../config/environment';

let io: SocketIOServer | null = null;

// Map to store user socket connections (userId -> Set of socketIds)
const userSockets: Map<string, Set<string>> = new Map();

/**
 * Initialize Socket.io server
 */
export const initializeSocketIO = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://diskusibisnis.my.id',
        'https://www.diskusibisnis.my.id',
        process.env.FRONTEND_URL || '',
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      // Allow connection without auth (for anonymous users)
      socket.data.userId = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      // Invalid token, allow connection but no userId
      socket.data.userId = null;
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    
    console.log(`🔌 Socket connected: ${socket.id}${userId ? ` (User: ${userId})` : ' (Anonymous)'}`);

    // Register user's socket
    if (userId) {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socket.id);
      
      // Join user's personal room
      socket.join(`user:${userId}`);
      
      console.log(`👤 User ${userId} now has ${userSockets.get(userId)!.size} active connection(s)`);
    }

    // Handle joining community rooms
    socket.on('join:community', (communityId: string) => {
      socket.join(`community:${communityId}`);
      console.log(`🏠 Socket ${socket.id} joined community:${communityId}`);
    });

    socket.on('leave:community', (communityId: string) => {
      socket.leave(`community:${communityId}`);
      console.log(`🚪 Socket ${socket.id} left community:${communityId}`);
    });

    // Handle joining question rooms (for real-time answers)
    socket.on('join:question', (questionId: string) => {
      socket.join(`question:${questionId}`);
      console.log(`❓ Socket ${socket.id} joined question:${questionId}`);
    });

    socket.on('leave:question', (questionId: string) => {
      socket.leave(`question:${questionId}`);
      console.log(`🚪 Socket ${socket.id} left question:${questionId}`);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
      
      if (userId) {
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
          }
        }
      }
    });

    // Ping-pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

/**
 * Get Socket.io instance
 */
export const getIO = (): SocketIOServer | null => {
  return io;
};

/**
 * Emit notification to specific user (all their devices)
 */
export const emitToUser = (userId: string, event: string, data: any): void => {
  if (!io) {
    console.warn('Socket.io not initialized');
    return;
  }
  
  io.to(`user:${userId}`).emit(event, data);
  console.log(`📤 Emitted "${event}" to user:${userId}`);
};

/**
 * Emit to all users in a community
 */
export const emitToCommunity = (communityId: string, event: string, data: any): void => {
  if (!io) return;
  io.to(`community:${communityId}`).emit(event, data);
};

/**
 * Emit to all users watching a question
 */
export const emitToQuestion = (questionId: string, event: string, data: any): void => {
  if (!io) return;
  io.to(`question:${questionId}`).emit(event, data);
};

/**
 * Emit to all connected users
 */
export const emitToAll = (event: string, data: any): void => {
  if (!io) return;
  io.emit(event, data);
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId: string): boolean => {
  return userSockets.has(userId) && userSockets.get(userId)!.size > 0;
};

/**
 * Get online users count
 */
export const getOnlineUsersCount = (): number => {
  return userSockets.size;
};

export default {
  initializeSocketIO,
  getIO,
  emitToUser,
  emitToCommunity,
  emitToQuestion,
  emitToAll,
  isUserOnline,
  getOnlineUsersCount,
};
