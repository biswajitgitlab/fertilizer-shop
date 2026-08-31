import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

// 15 Minutes Inactivity Limit in milliseconds (15 * 60 * 1000)
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

export const IdleTimer: React.FC = () => {
  return null;
};
