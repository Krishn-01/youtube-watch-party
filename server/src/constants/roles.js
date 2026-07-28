export const ROLES = {
  HOST: 'host',
  MODERATOR: 'moderator',
  PARTICIPANT: 'participant',
};

export const canControlPlayback = (role) =>
  role === ROLES.HOST || role === ROLES.MODERATOR;

export const canManageRoles = (role) => role === ROLES.HOST;

export const canChangeVideo = (role) =>
  role === ROLES.HOST || role === ROLES.MODERATOR;
