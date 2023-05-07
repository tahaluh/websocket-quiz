import { useContext } from 'react';
//
import { WebSocketContext } from './webSocketContext';

// ----------------------------------------------------------------------

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);

  if (!context) throw new Error('useAuthContext context must be use inside AuthProvider');

  return context;
};
