# User and Admin Management API

A Node.js backend API for managing users and administrators with different data models.

## Features

- User management with tokens and streak tracking
- Admin management
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

## Database Models

### User Model

- user_id (String, unique)
- name (String)
- organisation_uid (String)
- email (String, unique)
- tokens (Number)
- streak (Number)

### Admin Model

- user_id (String, unique)
- name (String)
- organisation_uid (String)
- email (String, unique)
