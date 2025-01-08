# Second Brain Backend Application

## Overview
The Second Brain Backend application powers a content storage and sharing platform that allows users to:
- Sign up and log in to their accounts.
- Store content (YouTube links, Twitter links, etc.) in their "Brain."
- Manage and retrieve stored content.
- Share their "Brain" publicly via a sharable link.

This backend is implemented using Express.js, MongoDB, and Zod for input validation. It includes user authentication via JWT, content management endpoints, and sharing functionality.

---

## Features
### User Authentication
- **Sign Up**: Create a new account with a unique username and password.
- **Sign In**: Log in to access your "Brain" and stored content.
- **JWT-based authentication** ensures secure user sessions.

### Content Management
- **Add**: Store content such as YouTube links, Twitter links, etc. 
- **Retrieve**: View your stored content list.
- **Delete**: Remove content associated with your account.
- **Filter**: Filter content based on its type.

### Sharing Brain
- **Share**: Share your stored content publicly with a unique sharable link.
- **Toggle Sharing**: Enable or disable the shareable link.
- **Check Sharing**: Verify if a link is publicly accessible.

---

## Technologies Used
- **Node.js** with **Express.js**: Server framework.
- **MongoDB**: Database for storing user data, content, and sharing links.
- **Mongoose**: ODM for MongoDB.
- **JWT**: JSON Web Token for user authentication.
- **Zod**: Input validation.
- **bcrypt**: Password hashing.
- **CORS**: Cross-Origin Resource Sharing configuration.

---

## Key Files

### app.ts
- Defines routes for user authentication, content management, and sharing.
- Contains API endpoints like `/api/v1/signup`, `/api/v1/signin`, `/api/v1/content`, and `/api/v1/brain/share`.

### db.ts
- Defines MongoDB schemas for users, content, and sharing links.

### middleware.ts
- Contains middleware for verifying JWT tokens.

### util.ts
- Utility function to generate random hashes for sharing links.

---

## API Endpoints

### Authentication
- **POST /api/v1/signup**
  - Input: `{ username, password }`
  - Output: Success or error message.
  
- **POST /api/v1/signin**
  - Input: `{ username, password }`
  - Output: Success message with JWT token.

### Content Management
- **POST /api/v1/content**
  - Input: `{ link, type, title }` (requires Authorization token)
  - Output: Created content details.

- **GET /api/v1/content**
  - Output: List of user's stored content.

- **DELETE /api/v1/content**
  - Input: `{ contentId }` (requires Authorization token)
  - Output: Deletion success message.

### Sharing Brain
- **POST /api/v1/brain/share**
  - Input: `{ share: 'true' | 'false' | 'check' }` (requires Authorization token)
  - Output: Share link or confirmation.

- **GET /api/v1/brain/:shareLink**
  - Output: Publicly shared content for the provided link.

---

## Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** instance (local or cloud)

### Environment Variables
- `JWT_SECRET_KEY`: Secret key for JWT.

### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd second-brain-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update MongoDB connection string in app.ts:
   ```javascript
   await mongoose.connect("<your-mongodb-connection-string>");
   ```
4. Start the server:
   ```bash
   npm start
   ```

The server runs on http://localhost:3000.

---

## Usage
### Testing APIs
You can use tools like Postman or cURL to test the API endpoints. Remember to include the JWT token in the Authorization header for authenticated routes.
