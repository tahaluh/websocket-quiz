// routes
import { PATH_AUTH } from './routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_WS_KEY = process.env.REACT_APP_HOST_API_KEY || '';

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = PATH_AUTH.login;
