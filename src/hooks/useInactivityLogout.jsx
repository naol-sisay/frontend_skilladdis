import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PUBLIC_ROUTES = ['/', '/login', '/register'];

const useInactivityLogout = (timeoutMinutes = 15, pathname = '') => {
  const navigate = useNavigate();

  useEffect(() => {
    // Don't arm the timer on public pages, or when there's no session to expire.
    if (PUBLIC_ROUTES.includes(pathname)) return;
    if (!localStorage.getItem('token')) return;

    let timeoutId;

    const performLogout = () => {
      // Obliterate the auth token
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Or whatever key you use for user data

      // Force redirect to login
      navigate('/login', { state: { message: 'Session expired due to inactivity.' } });
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Convert minutes to milliseconds
      timeoutId = setTimeout(performLogout, timeoutMinutes * 60 * 1000);
    };

    // Track every physical interaction with the page
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    // Initialize the timer on mount
    resetTimer();

    // Cleanup listeners when the route changes or the component unmounts
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timeoutId);
    };
  }, [navigate, timeoutMinutes, pathname]);
};

export default useInactivityLogout;