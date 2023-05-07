// routes
import { PATH_AUTH } from './routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_WS = process.env.REACT_APP_WSS_HOST || '';
// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = PATH_AUTH.login;
