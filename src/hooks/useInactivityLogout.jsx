import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useInactivityLogout = (timeoutMinutes = 15) => {
  const navigate = useNavigate();

  useEffect(() => {
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
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Initialize the timer on mount
    resetTimer();

    // Cleanup listeners when component unmounts
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timeoutId);
    };
  }, [navigate, timeoutMinutes]);
};

export default useInactivityLogout;