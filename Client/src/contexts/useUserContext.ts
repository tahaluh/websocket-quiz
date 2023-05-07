import { useContext } from 'react';
//
import { UserContext } from './userContext';

// ----------------------------------------------------------------------

export const useAuthContext = () => {
  const context = useContext(UserContext);

  if (!context) throw new Error('useAuthContext context must be use inside AuthProvider');

  return context;
};
