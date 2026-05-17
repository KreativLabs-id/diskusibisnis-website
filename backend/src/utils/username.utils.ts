import pool from '../config/database';

let backfillPromise: Promise<void> | null = null;
let hasBackfilledMissingUsernames = false;

export const normalizeUsername = (value: string | null | undefined, fallback = 'user'): string => {
  const normalized = (value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  const safe = normalized || fallback;
  return safe.length >= 3 ? safe.slice(0, 30) : `${safe}${'user'.slice(0, 3 - safe.length)}`.slice(0, 30);
};

export const generateUniqueUsername = async (
  baseValue: string | null | undefined,
  excludeUserId?: string
): Promise<string> => {
  const base = normalizeUsername(baseValue);
  let username = base;
  let counter = 1;

  while (true) {
    const params: any[] = [username];
    let query = 'SELECT id FROM public.users WHERE username = $1';

    if (excludeUserId) {
      params.push(excludeUserId);
      query += ' AND id <> $2';
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) return username;

    const suffix = String(counter);
    username = `${base.slice(0, 30 - suffix.length)}${suffix}`;
    counter++;
  }
};

export const backfillMissingUsernames = async (): Promise<void> => {
  if (hasBackfilledMissingUsernames) return;
  if (backfillPromise) return backfillPromise;

  backfillPromise = runBackfillMissingUsernames().finally(() => {
    backfillPromise = null;
  });

  return backfillPromise;
};

const runBackfillMissingUsernames = async (): Promise<void> => {
  const result = await pool.query(`
    SELECT id, display_name, email
    FROM public.users
    WHERE username IS NULL OR TRIM(username) = ''
    ORDER BY created_at ASC
  `);

  for (const user of result.rows) {
    const base = user.display_name || user.email?.split('@')[0] || 'user';
    const username = await generateUniqueUsername(base, user.id);
    await pool.query('UPDATE public.users SET username = $1 WHERE id = $2', [username, user.id]);
  }

  hasBackfilledMissingUsernames = true;
};
