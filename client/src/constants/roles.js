export const ROLES = {
  HOST: 'host',
  MODERATOR: 'moderator',
  PARTICIPANT: 'participant',
};

export const ROLE_LABELS = {
  [ROLES.HOST]: 'Host',
  [ROLES.MODERATOR]: 'Moderator',
  [ROLES.PARTICIPANT]: 'Participant',
};

export const ROLE_COLORS = {
  [ROLES.HOST]: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  [ROLES.MODERATOR]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [ROLES.PARTICIPANT]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export const canControlPlayback = (role) =>
  role === ROLES.HOST || role === ROLES.MODERATOR;

export const canManageRoles = (role) => role === ROLES.HOST;

export const canChangeVideo = (role) =>
  role === ROLES.HOST || role === ROLES.MODERATOR;
