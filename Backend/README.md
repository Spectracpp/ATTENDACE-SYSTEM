# User and Admin Management API

A Node.js backend API for managing users and administrators with different data models and JWT authentication.

## Features

- User management with tokens and streak tracking
- Admin management
- JWT-based authentication
- Password encryption with bcrypt
- Protected routes
- MongoDB database integration
- Express.js REST API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000 # optional, defaults to 5000
JWT_SECRET=your-jwt-secret-key
```

## Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### User Routes

#### Authentication

- **POST** `/api/users/create` - Register a new user

  ```json
  {
    "user_id": "12345",
    "name": "John Doe",
    "organisation_uid": "org123",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/users/login` - Login user

  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/users/logout` - Logout user (Protected)
  - Requires Authorization header: `Bearer <token>`

#### User Profile

- **GET** `/api/users/profile` - Get user profile (Protected)
  - Requires Authorization header: `Bearer <token>`

### Admin Routes

#### Authentication

- **POST** `/api/admins/create` - Register a new admin

  ```json
  {
    "user_id": "admin123",
    "name": "Admin User",
    "organisation_uid": "org123",
    "email": "admin@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/admins/login` - Login admin

  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/admins/logout` - Logout admin (Protected)
  - Requires Authorization header: `Bearer <token>`

#### Admin Profile

- **GET** `/api/admins/profile` - Get admin profile (Protected)
  - Requires Authorization header: `Bearer <token>`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

Tokens are provided upon successful registration and login. They expire after 24 hours.

## Database Models

### User Model

- user_id (String, unique)
- name (String)
- organisation_uid (String)
- email (String, unique)
- password (String, encrypted)
- tokens (Number)
- streak (Number)

### Admin Model

- user_id (String, unique)
- name (String)
- organisation_uid (String)
- email (String, unique)
- password (String, encrypted)

## Security Features

- Password encryption using bcrypt
- JWT-based authentication
- Protected routes
- Secure password handling (never returned in responses)
- Token expiration (24 hours)
- Environment variable configuration
- CORS enabled
