# 📚 DiskusiBisnis - Database Documentation

## 🎯 Overview

File `setup-database.sql` adalah **SATU-SATUNYA** file yang Anda butuhkan untuk setup database lengkap. Semua fix dan improvement sudah digabungkan ke dalam file ini.

## 🚀 Quick Start

```bash
# Cara paling mudah:
node scripts/run-sql.js

# Atau specify file:
node scripts/run-sql.js setup-database.sql
```

## 📊 Database Schema

### Core Tables (11 tables)

```
users                  - User accounts & profiles
  ├── questions        - User questions
  ├── answers          - Answers to questions
  ├── comments         - Comments on questions/answers
  ├── votes            - Upvote/downvote on questions/answers
  └── bookmarks        - Saved questions

tags                   - Question tags/categories
  └── question_tags    - Many-to-many: Questions ↔ Tags

communities            - UMKM communities
  └── community_members - Many-to-many: Users ↔ Communities

notifications          - User notifications
```

### Table Details

#### 1. **users**
```sql
- id (UUID, PK)
- email (unique)
- display_name
- reputation_points (INTEGER, default: 0)
- role (guest/member/admin)
- is_verified (BOOLEAN)
- created_at, updated_at
```

#### 2. **questions**
```sql
- id (UUID, PK)
- title
- content
- author_id (FK → users)
- community_id (FK → communities, nullable)
- views_count (auto-increment on view)
- upvotes_count, downvotes_count (calculated)
- answers_count (auto-increment)
- is_closed (BOOLEAN)
- created_at, updated_at
```

#### 3. **answers**
```sql
- id (UUID, PK)
- content
- question_id (FK → questions)
- author_id (FK → users)
- is_accepted (BOOLEAN)
- created_at, updated_at
```

#### 4. **votes**
```sql
- id (UUID, PK)
- user_id (FK → users)
- question_id (FK → questions, nullable)
- answer_id (FK → answers, nullable)
- vote_type ('upvote' | 'downvote')
- created_at

Constraints:
- User can only vote once per question
- User can only vote once per answer
- Must vote either question OR answer (not both)
```

#### 5. **communities**
```sql
- id (UUID, PK)
- name (unique)
- slug (unique)
- description
- category
- members_count (auto-counted)
- questions_count (auto-counted)
- is_popular (BOOLEAN)
- created_at, updated_at
```

#### 6. **notifications**
```sql
- id (UUID, PK)
- user_id (FK → users)
- type ('answer' | 'vote' | 'comment' | 'mention' | 'system')
- title
- message
- link
- is_read (BOOLEAN, default: false)
- created_at
```

## ⚡ Automatic Features

### 1. Reputation System

| Action | Points | Trigger |
|--------|--------|---------|
| Create question | +1 | `question_reputation` |
| Create answer | +2 | `answer_creation_reputation` |
| Question upvoted | +5 | `vote_reputation` |
| Answer upvoted | +10 | `vote_reputation` |
| Content downvoted | -2 | `vote_reputation` |
| Answer accepted | +15 | `answer_reputation` |
| Accept answer | +2 | `answer_reputation` |

**Important:** Reputation never goes below 0 (enforced by `ensure_reputation_positive`)

### 2. Auto Counting

- **Vote counts**: Calculated from `votes` table
- **Answer counts**: Auto-increment when answer created
- **View counts**: Increment via API call
- **Community members**: Auto-increment on join/leave
- **Tag usage**: Auto-increment when tag used

### 3. Notifications

| Event | Trigger | Recipient |
|-------|---------|-----------|
| Answer posted | Database trigger | Question author |
| Upvote | API call | Content author |
| Comment | API call | Content author |

## 🔧 Triggers & Functions

### Reputation Triggers

```sql
answer_reputation                  - Handle answer acceptance (UPDATE)
vote_reputation                    - Handle votes (INSERT/UPDATE/DELETE)
question_reputation                - Handle question creation (INSERT)
answer_creation_reputation         - Handle answer creation (INSERT)
ensure_reputation_positive         - Ensure min reputation = 0 (BEFORE UPDATE)
```

### Notification Triggers

```sql
create_answer_notification_trigger - Notify on answer (INSERT)
```

### Counter Triggers

```sql
tag_usage_counter                  - Update tag usage count
community_members_count            - Update community members
community_questions_count          - Update community questions
```

### Timestamp Triggers

```sql
update_users_updated_at           - Auto-update users.updated_at
update_communities_updated_at     - Auto-update communities.updated_at
update_tags_updated_at            - Auto-update tags.updated_at
update_questions_updated_at       - Auto-update questions.updated_at
update_answers_updated_at         - Auto-update answers.updated_at
update_comments_updated_at        - Auto-update comments.updated_at
```

## 🎲 Seed Data

### Default Tags (10)
- Pajak, Marketing, Legalitas, Keuangan
- SDM, Operasional, Digital, Modal
- Ekspor, Teknologi

### Sample Communities (5)
- UMKM Jakarta
- Digital Marketing UMKM
- Kuliner Nusantara
- Ekspor Import Indonesia
- Fintech untuk UMKM

## 🔍 Query Examples

### Get question with vote counts
```sql
SELECT 
    q.*,
    (SELECT COUNT(*) FROM votes WHERE question_id = q.id AND vote_type = 'upvote') as upvotes,
    (SELECT COUNT(*) FROM votes WHERE question_id = q.id AND vote_type = 'downvote') as downvotes
FROM questions q
WHERE q.id = '<question-id>';
```

### Get user's vote on question
```sql
SELECT vote_type 
FROM votes 
WHERE user_id = '<user-id>' 
AND question_id = '<question-id>';
```

### Get top users by reputation
```sql
SELECT display_name, reputation_points 
FROM users 
ORDER BY reputation_points DESC 
LIMIT 10;
```

### Get popular communities
```sql
SELECT name, members_count, questions_count 
FROM communities 
WHERE is_popular = true 
ORDER BY members_count DESC;
```

## 🛠️ Maintenance

### Reset reputation for all users
```sql
UPDATE users SET reputation_points = 0;
```

### Recalculate community member counts
```sql
UPDATE communities c
SET members_count = (
    SELECT COUNT(*) 
    FROM community_members cm 
    WHERE cm.community_id = c.id
);
```

### Clean up old notifications
```sql
DELETE FROM notifications 
WHERE is_read = true 
AND created_at < NOW() - INTERVAL '30 days';
```

## 🐛 Troubleshooting

### Vote trigger not working
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'vote_reputation';

-- Re-run setup script
node scripts/run-sql.js
```

### Reputation not updating
```sql
-- Check trigger status
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%reputation%';

-- Should show 5 triggers
```

### Notifications not appearing
```sql
-- Check notification trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'create_answer_notification_trigger';

-- Manual test
INSERT INTO notifications (user_id, type, title, message) 
VALUES ('<user-id>', 'system', 'Test', 'Test notification');
```

## 📝 Version History

### Version 2.0 (November 2025)
- ✅ Consolidated all SQL into single file
- ✅ Fixed vote reputation triggers (all operations)
- ✅ Fixed answer notification triggers
- ✅ Added vote type change handling
- ✅ Ensured reputation never negative
- ✅ Added proper ALTER TABLE for existing tables
- ✅ Improved error handling

### Version 1.0 (Initial)
- Basic table structure
- Simple reputation system
- Basic triggers

## 🔗 Related Documentation

- [README.md](./README.md) - Main documentation & quick start
- [COMPLETE-FIX-SUMMARY.md](./COMPLETE-FIX-SUMMARY.md) - All fixes summary
- [FIX-VOTE-PERSISTENCE.md](./FIX-VOTE-PERSISTENCE.md) - Vote persistence details
- [FIX-VOTING-REALTIME.md](./FIX-VOTING-REALTIME.md) - Real-time voting details

## 🤝 Contributing

When making changes to the database schema:

1. Update `setup-database.sql` (the master file)
2. Update this documentation
3. Test with: `node scripts/run-sql.js`
4. Document in README.md
5. Update version number

## ⚠️ Important Notes

- **DO NOT** modify individual fix files - they're archived
- **ALWAYS** use `setup-database.sql` for fresh installs
- **BACKUP** your database before running on production
- **TEST** in development environment first

---

**Last Updated:** November 2025
**Status:** Production Ready ✅
