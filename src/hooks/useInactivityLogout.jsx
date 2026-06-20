import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PUBLIC_ROUTES = ['/', '/login', '/register'];
const LAST_ACTIVITY_KEY = 'skilladdis:last-activity-at';
const LAST_ACTIVITY_TOKEN_KEY = 'skilladdis:last-activity-token';
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'click', 'touchstart'];
const SESSION_CHECK_MS = 5000;

const getLastActivity = () => {
  const stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : Date.now();
};

const useInactivityLogout = (timeoutMinutes = 15, pathname = '') => {
  const navigate = useNavigate();

  useEffect(() => {
    if (PUBLIC_ROUTES.includes(pathname)) return undefined;

    const timeoutMs = timeoutMinutes * 60 * 1000;
    let timeoutId;
    let intervalId;

    const getToken = () => localStorage.getItem('token');

    const clearSession = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      localStorage.removeItem(LAST_ACTIVITY_TOKEN_KEY);
    };

    const performLogout = () => {
      if (!getToken()) return;
      clearSession();
      navigate('/login', {
        replace: true,
        state: { message: 'Session expired due to inactivity.' },
      });
    };

    const syncTrackedSession = () => {
      const token = getToken();
      if (!token) return false;

      const trackedToken = localStorage.getItem(LAST_ACTIVITY_TOKEN_KEY);
      if (trackedToken !== token) {
        localStorage.setItem(LAST_ACTIVITY_TOKEN_KEY, token);
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      } else if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      }

      return true;
    };

    const scheduleLogout = () => {
      clearTimeout(timeoutId);
      if (!syncTrackedSession()) return;

      const elapsed = Date.now() - getLastActivity();
      const remaining = timeoutMs - elapsed;

      if (remaining <= 0) {
        performLogout();
        return;
      }

      timeoutId = setTimeout(performLogout, remaining);
    };

    const markActivity = () => {
      if (!syncTrackedSession()) return;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      scheduleLogout();
    };

    const validateSession = () => {
      if (!getToken()) {
        clearTimeout(timeoutId);
        return;
      }

      syncTrackedSession();
      if (Date.now() - getLastActivity() >= timeoutMs) {
        performLogout();
        return;
      }

      scheduleLogout();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        validateSession();
      }
    };

    const handleStorage = (event) => {
      if (event.key === 'token' && !event.newValue) {
        navigate('/login', { replace: true });
        return;
      }

      if (event.key === LAST_ACTIVITY_KEY) {
        validateSession();
      }
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, markActivity, { passive: true })
    );
    window.addEventListener('focus', validateSession);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    intervalId = window.setInterval(validateSession, SESSION_CHECK_MS);

    validateSession();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActivity));
      window.removeEventListener('focus', validateSession);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [navigate, timeoutMinutes, pathname]);
};

export default useInactivityLogout;
