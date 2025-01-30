import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'https://farm-bid.onrender.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    console.log('Initializing socket connection to:', API_URL);
    const socketInstance = io(API_URL, {
      auth: {
        token: `Bearer ${token}`
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('Socket connected successfully:', socketInstance.id);
      setConnected(true);
      socketInstance.emit('authenticate', `Bearer ${token}`);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setConnected(true);
      socketInstance.emit('authenticate', `Bearer ${token}`);
    });

    // Debug notification events
    socketInstance.on('newNotification', (notification) => {
      console.log('Received new notification:', notification);
    });

    setSocket(socketInstance);

    return () => {
      console.log('Cleaning up socket connection');
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [API_URL]);

  // Debug connection status
  useEffect(() => {
    console.log('Socket connection status:', connected ? 'Connected' : 'Disconnected');
  }, [connected]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
