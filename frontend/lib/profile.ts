export const normalizeProfileUsername = (value?: string | null) => {
  const normalized = (value || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  const safe = normalized || 'user';
  return safe.length >= 3 ? safe.slice(0, 30) : `${safe}${'user'.slice(0, 3 - safe.length)}`.slice(0, 30);
};

export const getProfileHref = (user?: { username?: string | null; displayName?: string | null; display_name?: string | null; author_name?: string | null; name?: string | null }) => {
  if (user?.username && user.username.trim().length > 0) {
    return `/profile/${user.username}`;
  }

  return '/users';
};
