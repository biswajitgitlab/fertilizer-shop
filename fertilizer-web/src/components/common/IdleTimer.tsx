import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

// 15 Minutes Inactivity Limit in milliseconds (15 * 60 * 1000)
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

export const IdleTimer: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isAuthenticated) {
      timerRef.current = setTimeout(() => {
        handleAutoLogout();
      }, INACTIVITY_LIMIT_MS);
    }
  };

  const handleAutoLogout = () => {
    logout();
    toast.error("Session expired: Logged out due to 15 minutes of inactivity.", {
      id: 'idle-auto-logout',
      duration: 4000,
    });
    navigate('/401?reason=inactivity');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Interaction events to reset idle timer
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

    // Start timer on initial mount / authentication state change
    resetTimer();

    const handleUserActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated]);

  return null;
};
