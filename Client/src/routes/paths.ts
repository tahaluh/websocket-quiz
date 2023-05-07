// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = "/dashboard";

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: "/login",
};

export const PATH_GAME = {
  joinRoom: "/join",
  roomLobby: (id: string) => `/room/${id}`,
};
