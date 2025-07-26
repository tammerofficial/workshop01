import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    
    // Show success message
    toast.success('You have been logged out successfully');
    
    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  // This component doesn't render anything
  return null;
};

export default Logout;