# 📡 API Documentation - DiskusiBisnis

Base URL: `http://localhost:5000/api`

## Authentication

Most endpoints require authentication via JWT Bearer token.

### Headers
\`\`\`
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
\`\`\`

---

## 🔐 Auth Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "member",
      "reputationPoints": 0
    },
    "token": "jwt_token_here"
  }
}
\`\`\`

### Login
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "John Doe",
      "avatarUrl": null,
      "role": "member",
      "reputationPoints": 50
    },
    "token": "jwt_token_here"
  }
}
\`\`\`

### Forgot Password
**POST** `/auth/forgot-password`

Send password reset email via Supabase.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Password reset email sent. Please check your inbox."
}
\`\`\`

---

## ❓ Question Endpoints

### Get All Questions
**GET** `/questions`

Retrieve questions with filters and pagination.

**Query Parameters:**
- `sort` (string): "newest" | "popular" | "unanswered" (default: "newest")
- `tag` (string): Filter by tag slug
- `search` (string): Search in title and content
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Example:**
\`\`\`
GET /questions?sort=popular&tag=pajak&page=1&limit=10
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "uuid",
        "title": "Bagaimana cara menghitung pajak UMKM?",
        "content": "Saya bingung cara menghitung pajak...",
        "author_name": "John Doe",
        "author_avatar": null,
        "author_reputation": 50,
        "upvotes_count": 5,
        "views_count": 120,
        "answers_count": 3,
        "has_accepted_answer": true,
        "tags": [
          {
            "id": "uuid",
            "name": "Pajak",
            "slug": "pajak"
          }
        ],
        "created_at": "2025-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
\`\`\`

### Get Question by ID
**GET** `/questions/:id`

Get detailed question with answers and comments.

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Bagaimana cara menghitung pajak UMKM?",
    "content": "Saya bingung cara menghitung pajak...",
    "author_id": "uuid",
    "author_name": "John Doe",
    "author_avatar": null,
    "author_reputation": 50,
    "upvotes_count": 5,
    "downvotes_count": 0,
    "views_count": 120,
    "answers_count": 3,
    "has_accepted_answer": true,
    "is_closed": false,
    "tags": [...],
    "answers": [
      {
        "id": "uuid",
        "content": "Untuk UMKM dengan omzet di bawah 4.8M...",
        "author_name": "Jane Smith",
        "upvotes_count": 10,
        "is_accepted": true,
        "comments": [...]
      }
    ],
    "comments": [...],
    "created_at": "2025-01-01T10:00:00Z"
  }
}
\`\`\`

### Create Question
**POST** `/questions` 🔒

Create a new question (authentication required).

**Request Body:**
\`\`\`json
{
  "title": "Bagaimana cara menghitung pajak UMKM?",
  "content": "Saya bingung cara menghitung pajak untuk UMKM...",
  "tags": ["uuid1", "uuid2"]
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "success": true,
  "message": "Question created successfully",
  "data": {
    "id": "uuid",
    "title": "...",
    "content": "...",
    "author_id": "uuid",
    "created_at": "2025-01-01T10:00:00Z"
  }
}
\`\`\`

### Update Question
**PUT** `/questions/:id` 🔒

Update existing question (author only).

**Request Body:**
\`\`\`json
{
  "title": "Updated title",
  "content": "Updated content",
  "tags": ["uuid1", "uuid2"]
}
\`\`\`

### Delete Question
**DELETE** `/questions/:id` 🔒

Delete question (author or admin only).

### Close Question
**POST** `/questions/:id/close` 🔒

Close question to prevent new answers (author or admin only).

---

## 💬 Answer Endpoints

### Create Answer
**POST** `/answers` 🔒

Post an answer to a question.

**Request Body:**
\`\`\`json
{
  "content": "Untuk UMKM dengan omzet di bawah 4.8M...",
  "questionId": "uuid"
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "...",
    "question_id": "uuid",
    "author_id": "uuid",
    "upvotes_count": 0,
    "is_accepted": false,
    "created_at": "2025-01-01T10:00:00Z"
  }
}
\`\`\`

### Update Answer
**PUT** `/answers/:id` 🔒

Update answer (author only).

### Delete Answer
**DELETE** `/answers/:id` 🔒

Delete answer (author or admin only).

### Accept Answer
**POST** `/answers/:id/accept` 🔒

Mark answer as accepted (question author only).

**Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Answer accepted"
}
\`\`\`

**Side Effects:**
- Answer `is_accepted` set to `TRUE`
- Question `has_accepted_answer` set to `TRUE`
- Answer author gets +15 reputation points
- Notification sent to answer author

---

## 💭 Comment Endpoints

### Create Comment
**POST** `/comments` 🔒

Add a comment to a question or answer.

**Request Body:**
\`\`\`json
{
  "content": "Great answer!",
  "commentableType": "answer",
  "commentableId": "uuid"
}
\`\`\`

### Update Comment
**PUT** `/comments/:id` 🔒

Update comment (author only).

### Delete Comment
**DELETE** `/comments/:id` 🔒

Delete comment (author or admin only).

---

## 👍 Vote Endpoints

### Cast Vote
**POST** `/votes` 🔒

Upvote or downvote a question/answer.

**Request Body:**
\`\`\`json
{
  "votableType": "question",
  "votableId": "uuid",
  "voteType": "upvote"
}
\`\`\`

**Voting Rules:**
- User can only vote once per item
- Clicking same vote type removes the vote
- Changing vote updates from upvote <-> downvote
- Upvotes add reputation: +5 for question, +10 for answer
- Downvotes don't affect reputation in MVP

**Response (201):**
\`\`\`json
{
  "success": true,
  "message": "Vote cast successfully"
}
\`\`\`

### Remove Vote
**DELETE** `/votes/:id` 🔒

Remove your vote.

---

## 👤 User Endpoints

### Get User Profile
**GET** `/users/:id`

Get public user profile.

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "display_name": "John Doe",
    "avatar_url": null,
    "bio": "UMKM owner from Jakarta",
    "reputation_points": 150,
    "created_at": "2025-01-01T10:00:00Z"
  }
}
\`\`\`

### Update Profile
**PUT** `/users/:id` 🔒

Update own profile.

**Request Body:**
\`\`\`json
{
  "displayName": "John Updated",
  "bio": "Updated bio",
  "avatarUrl": "https://..."
}
\`\`\`

### Get User Questions
**GET** `/users/:id/questions`

Get all questions by user.

### Get User Answers
**GET** `/users/:id/answers`

Get all answers by user.

---

## 🏷️ Tag Endpoints

### Get All Tags
**GET** `/tags`

Get all available tags.

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Pajak",
      "slug": "pajak",
      "description": "Pertanyaan seputar perpajakan UMKM",
      "usage_count": 45
    }
  ]
}
\`\`\`

### Get Tag by Slug
**GET** `/tags/:slug`

Get tag details with questions.

### Create Tag
**POST** `/tags` 🔒 👮

Create new tag (admin only).

### Update Tag
**PUT** `/tags/:id` 🔒 👮

Update tag (admin only).

### Delete Tag
**DELETE** `/tags/:id` 🔒 👮

Delete tag (admin only).

---

## 🔔 Notification Endpoints

### Get Notifications
**GET** `/notifications` 🔒

Get user notifications.

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "answer_accepted",
      "title": "Your answer was accepted!",
      "message": "John Doe accepted your answer",
      "link": "/questions/uuid",
      "is_read": false,
      "created_at": "2025-01-01T10:00:00Z"
    }
  ]
}
\`\`\`

### Mark as Read
**PUT** `/notifications/:id/read` 🔒

Mark notification as read.

### Mark All as Read
**PUT** `/notifications/read-all` 🔒

Mark all notifications as read.

---

## 👮 Admin Endpoints

All admin endpoints require admin role.

### Get All Users
**GET** `/admin/users` 🔒 👮

### Ban User
**POST** `/admin/users/:id/ban` 🔒 👮

### Unban User
**POST** `/admin/users/:id/unban` 🔒 👮

### Delete User
**DELETE** `/admin/users/:id` 🔒 👮

### Get All Questions (Admin)
**GET** `/admin/questions` 🔒 👮

### Delete Question (Admin)
**DELETE** `/admin/questions/:id` 🔒 👮

### Delete Answer (Admin)
**DELETE** `/admin/answers/:id` 🔒 👮

### Delete Comment (Admin)
**DELETE** `/admin/comments/:id` 🔒 👮

### Get Stats
**GET** `/admin/stats` 🔒 👮

Get platform statistics.

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "users": 500,
    "questions": 1200,
    "answers": 3500,
    "tags": 20
  }
}
\`\`\`

---

## 🔍 Error Responses

### 400 Bad Request
\`\`\`json
{
  "success": false,
  "message": "Validation error message"
}
\`\`\`

### 401 Unauthorized
\`\`\`json
{
  "success": false,
  "message": "Access token required"
}
\`\`\`

### 403 Forbidden
\`\`\`json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "success": false,
  "message": "Resource not found"
}
\`\`\`

### 500 Internal Server Error
\`\`\`json
{
  "success": false,
  "message": "Internal server error"
}
\`\`\`

---

## 📝 Notes

- 🔒 = Authentication required
- 👮 = Admin role required
- All timestamps are in ISO 8601 format (UTC)
- IDs are UUIDs (v4)
- Pagination default: page=1, limit=20

---

For more details, see the source code in `backend/src/controllers/`
