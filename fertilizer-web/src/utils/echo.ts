import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || '5t7x7ob2inhvggzfyba5',
  wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname || 'localhost',
  wsPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
  enabledTransports: ['ws', 'wss'],
  disabledTransports: ['sockjs', 'xhr_streaming', 'xhr_polling'],
});

// Suppress infinite connection failure console spam when local WebSocket server (Reverb) is offline
let failedCount = 0;
try {
  const pusherConnection = (echo as any).connector?.pusher?.connection;
  if (pusherConnection) {
    pusherConnection.bind('error', () => {
      failedCount++;
      if (failedCount >= 2) {
        try {
          echo.disconnect();
        } catch {
          // ignore
        }
      }
    });

    pusherConnection.bind('state_change', (states: { current: string }) => {
      if (states.current === 'unavailable' || states.current === 'failed') {
        failedCount++;
        if (failedCount >= 2) {
          try {
            echo.disconnect();
          } catch {
            // ignore
          }
        }
      } else if (states.current === 'connected') {
        failedCount = 0;
      }
    });
  }
} catch {
  // fail safe
}

