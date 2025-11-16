# Diskusi Bisnis - Backend API

Backend API untuk aplikasi Forum Q&A UMKM Indonesia, dibangun dengan Express.js dan TypeScript.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm atau yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` dengan konfigurasi database dan JWT secret Anda

4. Build the project:
```bash
npm run build
```

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## Production

Build dan run production:
```bash
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request reset password
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password (authenticated)

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/view` - Increment view count
- `POST /api/questions/:id/close` - Close question

### Answers
- `GET /api/answers` - Get answers
- `GET /api/answers/:id` - Get answer by ID
- `POST /api/answers` - Create new answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/accept` - Accept answer

### Communities
- `GET /api/communities` - Get all communities
- `GET /api/communities/:slug` - Get community by slug
- `POST /api/communities` - Create new community
- `POST /api/communities/:slug/join` - Join community
- `POST /api/communities/:slug/leave` - Leave community
- `GET /api/communities/:slug/questions` - Get community questions
- `GET /api/communities/:slug/members` - Get community members

### Comments
- `GET /api/comments` - Get comments
- `GET /api/comments/:id` - Get comment by ID
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Votes
- `POST /api/votes` - Create/update vote

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/:slug` - Get tag by slug

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/questions` - Get user questions
- `GET /api/users/:id/answers` - Get user answers
- `GET /api/users/:id/activities` - Get user activities
- `GET /api/users/:id/rank` - Get user rank

### Bookmarks
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks` - Create bookmark
- `DELETE /api/bookmarks` - Delete bookmark

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all notifications as read

### Admin (Admin only)
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/:id` - Update user (admin)
- `DELETE /api/admin/users/:id` - Delete user (admin)
- `POST /api/admin/users/:id/ban` - Ban user
- `POST /api/admin/users/:id/unban` - Unban user
- `POST /api/admin/users/:id/verify` - Verify user
- `POST /api/admin/users/:id/unverify` - Unverify user
- `GET /api/admin/questions` - Get all questions (admin)
- `PUT /api/admin/questions/:id` - Update question (admin)
- `DELETE /api/admin/questions/:id` - Delete question (admin)
- `GET /api/admin/communities` - Get all communities (admin)
- `POST /api/admin/communities/:id/ban` - Ban community
- `POST /api/admin/communities/:id/unban` - Unban community

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts
│   │   └── environment.ts
│   ├── controllers/     # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── questions.controller.ts
│   │   ├── answers.controller.ts
│   │   ├── communities.controller.ts
│   │   ├── comments.controller.ts
│   │   ├── votes.controller.ts
│   │   ├── tags.controller.ts
│   │   ├── users.controller.ts
│   │   ├── bookmarks.controller.ts
│   │   ├── notifications.controller.ts
│   │   └── admin.controller.ts
│   ├── middlewares/     # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── admin.middleware.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── questions.routes.ts
│   │   ├── answers.routes.ts
│   │   ├── communities.routes.ts
│   │   ├── comments.routes.ts
│   │   ├── votes.routes.ts
│   │   ├── tags.routes.ts
│   │   ├── users.routes.ts
│   │   ├── bookmarks.routes.ts
│   │   ├── notifications.routes.ts
│   │   ├── admin.routes.ts
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── slug.utils.ts
│   │   ├── response.utils.ts
│   │   └── validator.utils.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── dist/                # Compiled JavaScript
├── .env.example         # Environment variables example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for JWT | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Security Features

- JWT Authentication
- Password hashing dengan bcrypt
- Helmet untuk security headers
- CORS protection
- Rate limiting
- SQL injection protection
- XSS protection

## License

ISC
