# API Documentation

## Overview

This project uses a React frontend with a JSON Server backend. The client runs on port 3002 and proxies API requests to the server on port 3001.

**Base URL (Client):** `http://localhost:3002/`  
**Base URL (Server):** `http://localhost:3001`

> Note: The client automatically proxies `/api/*` requests to the server, so you can use `/api/users` and `/api/posts` from the frontend.

---

## Authentication Endpoints

### Login
Authentication is handled client-side using cookies. The server validates credentials against the users collection.

**Method:** `GET /api/users?username={username}&password={password}`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User's username |
| password | string | Yes | User's password |

**Response:**
```json
[
  {
    "id": "1",
    "name": "Ragu",
    "username": "ragu",
    "password": "password123"
  }
]
```

**Example:**
```
GET /api/users?username=ragu&password=password123
```

---

## Users Endpoints

### Get All Users
Retrieves all registered users.

**Method:** `GET /api/users`

**Response:**
```json
[
  {
    "id": "1",
    "name": "Ragu",
    "username": "ragu",
    "password": "password123"
  }
]
```

### Get Single User
Retrieves a specific user by ID.

**Method:** `GET /api/users/{id}`

**Example:** `GET /api/users/1`

### Create User (Register)
Registers a new user.

**Method:** `POST /api/users`

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "id": "1772686554637",
  "name": "John Doe",
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:** Returns the created user object.

### Update User
Updates an existing user.

**Method:** `PUT /api/users/{id}`

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "id": "1",
  "name": "Updated Name",
  "username": "updatedusername",
  "password": "newpassword123"
}
```

### Delete User
Deletes a user by ID.

**Method:** `DELETE /api/users/{id}`

---

## Posts Endpoints

### Get All Posts
Retrieves all posts.

**Method:** `GET /api/posts`

**Response:**
```json
[
  {
    "id": "1",
    "userId": "1",
    "username": "ragu",
    "title": "My First Post",
    "body": "Redux Toolkit with React and TypeScript!",
    "createdAt": "2026-03-04T10:00:00.000Z",
    "comments": [
      {
        "postId": "1",
        "userId": "2",
        "username": "testuser",
        "body": "Okay thanks",
        "id": "1772686088397",
        "createdAt": "2026-03-05T04:48:08.397Z"
      }
    ]
  }
]
```

### Get Single Post
Retrieves a specific post by ID.

**Method:** `GET /api/posts/{id}`

**Example:** `GET /api/posts/1`

### Create Post
Creates a new post.

**Method:** `POST /api/posts`

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "id": "1772686554637",
  "userId": "1",
  "username": "ragu",
  "title": "My New Post",
  "body": "This is the post content",
  "createdAt": "2026-03-05T16:00:00.000Z",
  "comments": []
}
```

**Response:** Returns the created post object.

### Update Post
Updates an existing post.

**Method:** `PUT /api/posts/{id}`

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "id": "1",
  "userId": "1",
  "username": "ragu",
  "title": "Updated Title",
  "body": "Updated content",
  "createdAt": "2026-03-04T10:00:00.000Z",
  "comments": []
}
```

### Delete Post
Deletes a post by ID.

**Method:** `DELETE /api/posts/{id}`

---

## Comments Endpoints

Comments are nested within posts. To manage comments, you update the post that contains them.

### Add Comment
Adds a comment to a post by updating the post with the new comment in the comments array.

**Method:** `PUT /api/posts/{postId}`

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "id": "1",
  "userId": "1",
  "username": "ragu",
  "title": "My First Post",
  "body": "Redux Toolkit with React and TypeScript!",
  "createdAt": "2026-03-04T10:00:00.000Z",
  "comments": [
    {
      "postId": "1",
      "userId": "2",
      "username": "testuser",
      "body": "New comment",
      "id": "1772686088397",
      "createdAt": "2026-03-05T04:48:08.397Z"
    }
  ]
}
```

### Update Comment
Updates a comment by updating the post containing the comment.

**Method:** `PUT /api/posts/{postId}`

**Request Body:** Same as above, with modified comment in the comments array.

### Delete Comment
Deletes a comment by updating the post with the comment removed from the comments array.

**Method:** `PUT /api/posts/{postId}`

**Request Body:** Post object with the comment removed from comments array.

---

## Filtering and Querying

JSON Server supports several query operators:

### Filter
**Syntax:** `GET /api/users?username=ragu`

### Multiple Filters
**Syntax:** `GET /api/users?username=ragu&password=password123`

### Pagination
**Syntax:** `GET /api/posts?_page=1&_limit=10`

### Sort
**Syntax:** `GET /api/posts?_sort=createdAt&_order=desc`

### Full Text Search
**Syntax:** `GET /api/posts?title_like=redux`

---

## Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | User's full name |
| username | string | Unique username |
| password | string | User's password |

### Post
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| userId | string | ID of the author |
| username | string | Username of the author |
| title | string | Post title |
| body | string | Post content |
| createdAt | string | ISO timestamp |
| comments | Comment[] | Array of comments |

### Comment
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| postId | string | ID of the parent post |
| userId | string | ID of the commenter |
| username | string | Username of the commenter |
| body | string | Comment content |
| createdAt | string | ISO timestamp |

---

## Running the Project

### Start the Server
```bash
cd server
npm run server
```
The API will be available at `http://localhost:3001`

### Start the Client
```bash
cd client
npm run dev
```
The frontend will be available at `http://localhost:3002`

---

## Error Responses

All endpoints may return standard HTTP status codes:

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

Error responses include a JSON object with error details.
