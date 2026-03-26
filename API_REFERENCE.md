# DeyMake API Reference

Official reference for the backend API implemented in `deymake_backend`.

- Base URL: `https://api.deymake.com/api/v1`
- Framework: Laravel 11
- Auth: Laravel Sanctum personal access tokens (`Authorization: Bearer <token>`)
- Default content type: `application/json`
- File upload endpoint uses `multipart/form-data`
- Route count documented here: `73`

## Conventions

### Response envelope

Successful responses use this envelope:

```json
{
  "message": "Human readable message.",
  "data": {}
}
```

Some successful actions return only a `message` with no `data` payload.

### Error responses

- `401 Unauthorized` for missing/invalid auth on protected routes.
- `403 Forbidden` for ownership/participant violations.
- `404 Not Found` for missing models and draft content hidden from non-owners.
- `422 Unprocessable Entity` for validation failures and some business-rule failures.
- `503 Service Unavailable` when an OAuth provider is not configured on the backend.

Validation errors follow Laravel's default JSON validation style, for example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### Authentication

Protected endpoints are behind `auth:sanctum` and require:

```http
Authorization: Bearer {token}
Accept: application/json
```

`POST /auth/register` and `POST /auth/login` both return a bearer token.

### Pagination

No API endpoints currently implement pagination. Collection endpoints return full arrays.

## Resource shapes

These are the main resource objects returned throughout the API.

### User

- `id`
- `fullName`
- `email`
- `avatarUrl`
- `bio`
- `isOnline`
- `createdAt`

### Profile

- `id`
- `fullName`
- `bio`
- `avatarUrl`
- `isOnline`
- `subscriberCount`
- `createdAt`
- `email` (only populated when the authenticated user is viewing their own record)

### Category

- `id`
- `name`
- `label`
- `slug`
- `thumbnailUrl`
- `subscriberCount`
- `subscribers`
- `createdAt`

### Upload

- `id`
- `type` (`image`, `gif`, `video`)
- `disk`
- `path`
- `url`
- `originalName`
- `mimeType`
- `size`
- `createdAt`

### Video

- `id`
- `type`
- `title`
- `caption`
- `description`
- `location`
- `taggedUsers` (array of user IDs)
- `mediaUrl`
- `thumbnailUrl`
- `views`
- `likes`
- `dislikes`
- `saves`
- `shares`
- `commentsCount`
- `isLive`
- `isDraft`
- `author` (Profile)
- `creator` (same data as `author`)
- `category` (Category or `null`)
- `currentUserState.liked`
- `currentUserState.disliked`
- `currentUserState.saved`
- `currentUserState.subscribed`
- `createdAt`

### Comment

- `id`
- `body`
- `text`
- `parentId`
- `likes`
- `dislikes`
- `repliesCount`
- `user` (Profile)
- `currentUserState.liked`
- `currentUserState.disliked`
- `createdAt`

### Notification

- `id`
- `type`
- `title`
- `body`
- `data` (object)
- `readAt`
- `createdAt`

### Message

- `id`
- `body`
- `text`
- `isMine`
- `sender` (Profile)
- `createdAt`

### Conversation

- `id`
- `participant` (primary other participant for 1:1 display)
- `participants` (Profile[])
- `lastMessage` (Message or `null`)
- `unreadCount`
- `status`
- `createdAt`
- `updatedAt`

### Waitlist entry

- `id`
- `fullName`
- `email`
- `phone`
- `country`
- `describes`
- `loveToSee`
- `agreed`
- `status`
- `createdAt`

## System endpoints

### Health

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/health` | No | None | `200`, `data.status`, `data.app`, `data.timestamp` |

### Informational pages

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/help` | No | None | `200`, `data.title`, `data.content` |
| GET | `/legal/privacy` | No | None | `200`, `data.title`, `data.content` |
| GET | `/legal/terms` | No | None | `200`, `data.title`, `data.content` |

## Authentication

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | No | JSON: `fullName` required string max 255; `email` required email unique; `password` required min 8, mixed case, includes number | `201`, `data.user`, `data.token`, `data.tokenType` |
| POST | `/auth/login` | No | JSON: `email` required email; `password` required string | `200`, `data.user`, `data.token`, `data.tokenType` |
| POST | `/auth/forgot-password` | No | JSON: `email` required and must exist | `200`, `data.email`, `data.resetToken`, `data.expiresInMinutes` |
| POST | `/auth/reset-password` | No | JSON: `email` required and must exist; `token` required; `password` required min 8, mixed case, includes number | `200`, `data.user` |
| GET | `/auth/oauth/{provider}/redirect` | No | Path param `provider`: `google` or `facebook` | `302` redirect to the provider auth screen; JSON clients receive `503` when credentials are missing |
| GET | `/auth/oauth/{provider}/callback` | No | Path/query params from provider callback | `302` redirect to frontend `/auth/callback#provider=...&token=...`; JSON clients receive provider/config errors as JSON |
| GET | `/auth/me` | Yes | None | `200`, `data.user` |
| POST | `/auth/logout` | Yes | None | `200`, message only |

### Auth notes

- Login failures return `422` with an `errors.email` array.
- Password reset tokens expire after 60 minutes.
- The current implementation returns the raw password reset token in the response instead of sending email.
- OAuth is initiated from the frontend but completed on the backend so provider secrets stay server-side.
- Backend OAuth configuration uses `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, and `FACEBOOK_REDIRECT_URI`.

## Waitlist

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| POST | `/waitlist` | No | JSON: `firstName` required; `email` required unique; `phone` nullable; `country` required; `describes` required; `loveToSee` nullable; `agreed` accepted | `201`, `data.waitlistEntry` |

## Discovery and browsing

### Home and categories

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/home` | No | None | `200`, `data.trending`, `data.categories`, `data.liveStreams` |
| GET | `/categories` | No | None | `200`, `data.categories` |

### Videos

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/videos/trending` | No | None | `200`, `data.videos` |
| GET | `/videos/live` | No | None | `200`, `data.videos` |
| GET | `/videos` | No | Optional query: `category` as category ID or slug | `200`, `data.videos` |
| GET | `/videos/{video}` | No | Path param `video` | `200`, `data.video` |
| GET | `/videos/{video}/related` | No | Path param `video` | `200`, `data.videos` |
| POST | `/videos/{video}/view` | No | Path param `video` | `200`, `data.views`, `data.video` |
| POST | `/videos/{video}/share` | No | Path param `video` | `200`, `data.shares`, `data.shareUrl` |

### Discovery notes

- Public listings exclude draft videos.
- `GET /videos/{video}` returns `404` for draft videos unless the viewer is the owner.
- `currentUserState` is always present in `Video` responses; for guests its booleans resolve to `false`.

## Search and leaderboard

### Search

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/search` | No | Optional query: `q` | `200`, `data.videos`, `data.creators`, `data.categories` |
| GET | `/search/suggestions` | No | Optional query: `q` | `200`, limited suggestion arrays in `data.videos`, `data.creators`, `data.categories` |
| GET | `/search/videos` | No | Optional query: `q` | `200`, `data.videos` |
| GET | `/search/creators` | No | Optional query: `q` | `200`, `data.creators` |
| GET | `/search/categories` | No | Optional query: `q` | `200`, `data.categories` |

### Leaderboard

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/leaderboard` | No | Optional query: `period` = `daily`, `weekly`, or `monthly` (defaults to `daily`) | `200`, `data.period`, `data.podium`, `data.standings`, `data.currentUserRank` |

### Leaderboard object shape

Each podium/standing/current-user-rank item contains:

- `userId`
- `rank`
- `score`
- `videosCount`
- `trend`
- `user` (Profile)

## Public users and creator data

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/users/search` | No | Optional query: `q` | `200`, `data.users` |
| GET | `/users/{user}` | No | Path param `user` | `200`, `data.user` |
| GET | `/users/{user}/posts` | No | Path param `user` | `200`, `data.videos` |

## Uploads and video creation

### Uploads

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| POST | `/uploads` | Yes | `multipart/form-data`: `file` required; max `51200` KB; allowed MIME types `image/jpeg`, `image/png`, `image/gif`, `video/mp4`, `video/quicktime`, `video/x-msvideo` | `201`, `data.upload` |
| POST | `/uploads/presign` | Yes | JSON: `type` required (`image`, `gif`, `video`); `originalName` required string max 255 | `200`, `data.strategy`, `data.method`, `data.endpoint`, `data.path`, `data.headers` |

### Video creation and management

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| POST | `/videos` | Yes | JSON: `type` required; optional `categoryId`, `uploadId`, `title`, `caption`, `description`, `location`, `taggedUsers[]`, `mediaUrl`, `thumbnailUrl`, `isLive`, `isDraft` | `201`, `data.video` |
| PATCH | `/videos/{video}` | Yes | Same fields as create, all optional; owner only | `200`, `data.video` |
| POST | `/videos/{video}/publish` | Yes | None; owner only | `200`, `data.video` |
| POST | `/videos/{video}/report` | Yes | JSON: optional `reason` max 255, optional `details` max 1000 | `201`, message only |

### Video management notes

- `uploadId` must belong to the authenticated user or the API returns `403`.
- If `description` is omitted during creation, it falls back to `caption`.
- `isDraft` defaults to `true` when omitted during creation.

## Video engagement

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| POST | `/videos/{video}/like` | Yes | Path param `video` | `200`, `data.video` |
| DELETE | `/videos/{video}/like` | Yes | Path param `video` | `200`, `data.video` |
| POST | `/videos/{video}/dislike` | Yes | Path param `video` | `200`, `data.video` |
| DELETE | `/videos/{video}/dislike` | Yes | Path param `video` | `200`, `data.video` |
| POST | `/videos/{video}/save` | Yes | Path param `video` | `200`, `data.video` |
| DELETE | `/videos/{video}/save` | Yes | Path param `video` | `200`, `data.video` |
| POST | `/creators/{creator}/subscribe` | Yes | Path param `creator` | `200`, `data.creator.id`, `data.creator.subscriberCount`, `data.creator.subscribed=true` |
| DELETE | `/creators/{creator}/subscribe` | Yes | Path param `creator` | `200`, `data.creator.id`, `data.creator.subscriberCount`, `data.creator.subscribed=false` |

### Engagement notes

- Liking a video removes any existing dislike by the same user.
- Disliking a video removes any existing like by the same user.
- Subscribing to yourself returns `422`.

## Comments and replies

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/videos/{video}/comments` | No | Path param `video` | `200`, `data.comments` |
| POST | `/videos/{video}/comments` | Yes | JSON: `body` required string max 1000 | `201`, `data.comment` |
| GET | `/comments/{comment}/replies` | No | Path param `comment` | `200`, `data.replies` |
| POST | `/comments/{comment}/replies` | Yes | JSON: `body` required string max 1000 | `201`, `data.reply` |
| PATCH | `/comments/{comment}` | Yes | JSON: `body` required string max 1000; owner only | `200`, `data.comment` |
| DELETE | `/comments/{comment}` | Yes | Path param `comment`; owner only | `200`, message only |
| POST | `/comments/{comment}/like` | Yes | Path param `comment` | `200`, `data.comment` |
| DELETE | `/comments/{comment}/like` | Yes | Path param `comment` | `200`, `data.comment` |
| POST | `/comments/{comment}/dislike` | Yes | Path param `comment` | `200`, `data.comment` |
| DELETE | `/comments/{comment}/dislike` | Yes | Path param `comment` | `200`, `data.comment` |

### Comment notes

- Comment endpoints that depend on a video return `404` for draft videos unless the viewer is the owner.
- Liking a comment removes any existing dislike by the same user.
- Disliking a comment removes any existing like by the same user.

## My account and profile

### Profile

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/me/profile` | Yes | None | `200`, `data.profile` |
| PATCH | `/me/profile` | Yes | JSON: optional `fullName`, optional nullable `bio`, optional nullable `avatarUrl` | `200`, `data.profile` |

### My videos

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/me/posts` | Yes | None | `200`, `data.videos` |
| GET | `/me/liked` | Yes | None | `200`, `data.videos` |
| GET | `/me/saved` | Yes | None | `200`, `data.videos` |
| GET | `/me/drafts` | Yes | None | `200`, `data.videos` |

### Preferences

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/me/preferences` | Yes | None | `200`, `data.preferences` |
| PATCH | `/me/preferences` | Yes | JSON: optional `notificationSettings`, `language`, `displayPreferences`, `accessibilityPreferences` | `200`, `data.preferences` |

### Default preference structure

```json
{
  "notificationSettings": {
    "messages": true,
    "comments": true,
    "likes": true,
    "subscriptions": true
  },
  "language": "en",
  "displayPreferences": {
    "theme": "system",
    "autoplay": true
  },
  "accessibilityPreferences": {
    "captions": false,
    "reducedMotion": false
  }
}
```

## Notifications

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/notifications` | Yes | None | `200`, `data.notifications` |
| POST | `/notifications/read-all` | Yes | None | `200`, message only |
| POST | `/notifications/{notification}/read` | Yes | Path param `notification`; owner only | `200`, `data.notification` |
| DELETE | `/notifications/{notification}` | Yes | Path param `notification`; owner only | `200`, message only |

## Messaging

| Method | Path | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| GET | `/conversations` | Yes | None | `200`, `data.conversations` |
| GET | `/conversations/suggested` | Yes | None | `200`, `data.users` |
| POST | `/conversations` | Yes | JSON: `userId` required existing user; optional `message` max 2000 | `201`, `data.conversation` |
| GET | `/conversations/{conversation}/messages` | Yes | Path param `conversation`; participant only | `200`, `data.messages` |
| POST | `/conversations/{conversation}/messages` | Yes | JSON: `body` required string max 2000; participant only | `201`, `data.message` |
| POST | `/conversations/{conversation}/read` | Yes | Path param `conversation`; participant only | `200`, message only |

### Messaging notes

- Conversations are one-to-one based on the current implementation.
- `POST /conversations` reuses the existing 1:1 conversation if one already exists.
- Starting a conversation with yourself returns `422`.
- Sending a message updates the sender's `last_read_at` and creates notifications for other participants.

## Quick start examples

### Register

`POST /auth/register`

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPass1"
}
```

### Login

`POST /auth/login`

```json
{
  "email": "jane@example.com",
  "password": "StrongPass1"
}
```

### Create a video draft

`POST /videos`

```json
{
  "type": "video",
  "uploadId": 12,
  "caption": "My first post",
  "description": "Behind the scenes",
  "location": "Lagos",
  "taggedUsers": [4, 9],
  "isDraft": true
}
```

### Post a comment

`POST /videos/{video}/comments`

```json
{
  "body": "This is amazing 🔥"
}
```

## Coverage source

This document was compiled from:

- `deymake_backend/routes/api.php`
- API controllers in `deymake_backend/app/Http/Controllers/Api`
- API resources in `deymake_backend/app/Http/Resources`
- Validation requests in `deymake_backend/app/Http/Requests`
- A verified `php artisan route:list --path=api/v1` run