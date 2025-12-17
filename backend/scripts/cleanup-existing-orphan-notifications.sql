-- ============================================
-- CLEANUP EXISTING ORPHAN NOTIFICATIONS
-- Run this once to clean up notifications pointing to deleted content
-- ============================================

-- 1. Delete notifications for deleted questions
DELETE FROM notifications n
WHERE n.link LIKE '/questions/%'
AND NOT EXISTS (
    SELECT 1 FROM questions q 
    WHERE n.link = '/questions/' || q.id::TEXT
    OR n.link LIKE '/questions/' || q.id::TEXT || '/%'
);

-- 2. Delete answer notifications where the answer no longer exists
-- First, let's identify answer notifications by checking if question still has that answer
DELETE FROM notifications n
WHERE n.type = 'answer'
AND n.link LIKE '/questions/%'
AND NOT EXISTS (
    SELECT 1 FROM questions q
    JOIN answers a ON a.question_id = q.id
    WHERE n.link = '/questions/' || q.id::TEXT
);

-- 3. Delete vote notifications for content that no longer exists
DELETE FROM notifications n
WHERE n.type = 'vote'
AND n.link LIKE '/questions/%'
AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE n.link = '/questions/' || q.id::TEXT
);

-- 4. Delete accepted_answer notifications for answers that no longer exist or are not accepted
DELETE FROM notifications n
WHERE n.type = 'accepted_answer'
AND n.link LIKE '/questions/%'
AND NOT EXISTS (
    SELECT 1 FROM questions q
    JOIN answers a ON a.question_id = q.id AND a.is_accepted = true
    WHERE n.link = '/questions/' || q.id::TEXT
    AND n.user_id = a.author_id
);

-- 5. Delete comment notifications for deleted content
DELETE FROM notifications n
WHERE n.type = 'comment'
AND n.link LIKE '/questions/%'
AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE n.link = '/questions/' || q.id::TEXT
);

-- 6. Delete mention notifications for deleted content
DELETE FROM notifications n
WHERE n.type = 'mention'
AND n.link LIKE '/questions/%'
AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE n.link = '/questions/' || q.id::TEXT
);

-- Show remaining count
SELECT COUNT(*) as remaining_notifications FROM notifications;
