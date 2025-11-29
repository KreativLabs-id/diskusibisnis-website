-- Script untuk membersihkan notifikasi duplikat dan format yang salah

-- 1. Hapus notifikasi vote duplikat (simpan yang paling baru)
DELETE FROM notifications n1
WHERE n1.type = 'vote'
AND n1.id NOT IN (
  SELECT DISTINCT ON (user_id, message, link) id
  FROM notifications
  WHERE type = 'vote'
  ORDER BY user_id, message, link, created_at DESC
);

-- 2. Hapus notifikasi mention duplikat (simpan yang paling baru)
DELETE FROM notifications n1
WHERE n1.type = 'mention'
AND n1.id NOT IN (
  SELECT DISTINCT ON (user_id, message, link) id
  FROM notifications
  WHERE type = 'mention'
  ORDER BY user_id, message, link, created_at DESC
);

-- 3. Hapus notifikasi dengan format lama yang salah (yang dimulai dengan 'in "')
DELETE FROM notifications
WHERE type = 'mention'
AND (message LIKE 'in "%' OR message LIKE 'in ''%' OR title = 'Mention');

-- 4. Tampilkan jumlah notifikasi yang tersisa
SELECT type, COUNT(*) as count FROM notifications GROUP BY type ORDER BY type;
