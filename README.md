# AI Chat Rate Limiter

AI chat service with comprehensive rate limiting, user authentication, and request management built with TypeScript, Express.js, and Vercel AI SDK.

## Features

- **Advanced Rate Limiting**: Fixed window rate limiting with user-type based limits
- **Multi-tier Authentication**: Support for guest, free, and premium users
- **AI Integration**: Seamless integration with OpenAI via Vercel AI SDK
- **Cost Optimization**: Rate limit checks before AI calls to prevent unnecessary costs
- **Comprehensive Logging**: Structured logging with request tracking and performance metrics
- **Clean Architecture**: Dependency injection with Inversify container
- **Type Safety**: Full TypeScript implementation with strict type checking

## Rate Limiting

### Rate Limit Configuration

| User Type | Requests per Hour | Authentication Required |
|-----------|-------------------|------------------------|
| Guest     | 3                | No (tracked by IP)     |
| Free      | 10               | Yes (JWT token)        |
| Premium   | 50               | Yes (JWT token)        |

### Fixed Window Algorithm

- **Window Duration**: 1 hour (configurable)
- **Reset Behavior**: Hard reset at window boundary
- **Tracking**: By user ID for authenticated users, by IP for guests
- **Storage**: In-memory with automatic cleanup of expired windows

## API Endpoints

### Authentication Endpoints

```
POST /auth/register     - Create new user account
POST /auth/login        - Sign in existing user
```

### Chat Endpoints

```
POST /chat - Send message to AI (rate limited)
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-chat-rate-limit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=12

   # AI Service
   OPENAI_API_KEY=your-openai-api-key-here

   # Rate Limiting (Optional - defaults provided)
   RATE_LIMIT_WINDOW_MS=3600000          # 1 hour
   RATE_LIMIT_GUEST_LIMIT=3              # Guest requests per hour
   RATE_LIMIT_FREE_LIMIT=10              # Free user requests per hour
   RATE_LIMIT_PREMIUM_LIMIT=50           # Premium user requests per hour
   RATE_LIMIT_CLEANUP_INTERVAL_MS=900000 # 15 minutes
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## Rate Limiting Test Examples

### Testing Guest User Rate Limiting

**Test 1: Guest user within limit (should succeed)**
```bash
# First request - should succeed
curl -X POST http://localhost:3000/api/chat
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, this is my first request"}'

# Response: 200 OK with AI response
```

**Test 2: Guest user exceeding limit (should fail)**
```bash
# Make 4 requests quickly (guest limit is 3 per hour)
for i in {1..4}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/chat
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Hello, this is request $i\"}"
  echo -e "\n---"
done

# Expected: First 3 requests succeed, 4th request returns 429 Too Many Requests
```

### Testing Free User Rate Limiting

**Test 1: Create and authenticate free user**
```bash
# Step 1: Sign up as free user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "freeuser@example.com",
    "password": "Password@123",
    "type": "free"
  }'

# Step 2: Sign in to get JWT token
JWT_TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "freeuser@example.com",
    "password": "Password@123"
  }' | jq -r '.data.token')

echo "JWT Token: $JWT_TOKEN"
```

**Test 2: Free user within limit (should succeed)**
```bash
# Make 5 requests (free limit is 10 per hour)
for i in {1..5}; do
  echo "Free user request $i:"
  curl -X POST http://localhost:3000/api/chat
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -d "{\"message\": \"Free user request $i\"}"
  echo -e "\n---"
done

# Expected: All requests should succeed
```

**Test 3: Free user exceeding limit (should fail)**
```bash
# Make 11 requests (free limit is 10 per hour)
for i in {1..11}; do
  echo "Free user request $i:"
  curl -X POST http://localhost:3000/api/chat
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -d "{\"message\": \"Free user request $i\"}"
  echo -e "\n---"
done

# Expected: First 10 requests succeed, 11th request returns 429 Too Many Requests
```

### Testing Premium User Rate Limiting

**Test 1: Create and authenticate premium user**
```bash
# Step 1: Sign up as premium user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "premiumuser@example.com",
    "password": "Password@123",
    "type": "premium"
  }'

# Step 2: Sign in to get JWT token
PREMIUM_TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "premiumuser@example.com",
    "password": "Password@123"
  }' | jq -r '.data.token')

echo "Premium JWT Token: $PREMIUM_TOKEN"
```

**Test 2: Premium user high volume (should succeed)**
```bash
# Make 25 requests (premium limit is 50 per hour)
for i in {1..25}; do
  echo "Premium user request $i:"
  curl -X POST http://localhost:3000/api/chat
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $PREMIUM_TOKEN" \
    -d "{\"message\": \"Premium user request $i\"}"
  echo -e "\n---"
done

# Expected: All requests should succeed
```

**Test 3: Premium user exceeding limit (should fail)**
```bash
# Make 51 requests (premium limit is 50 per hour)
for i in {1..51}; do
  echo "Premium user request $i:"
  curl -X POST http://localhost:3000/api/chat
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $PREMIUM_TOKEN" \
    -d "{\"message\": \"Premium user request $i\"}"
  echo -e "\n---"
done

# Expected: First 50 requests succeed, 51st request returns 429 Too Many Requests
```

### Rate Limit Response Format

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": "Rate limit exceeded for premium users. Try again in 45 minutes.",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req-12345",
    "version": "1.0.0"
  }
}
```

### Testing Rate Limit Reset

Rate limits reset at the beginning of each hour. To test reset behavior:

```bash
# Check current rate limit status
curl -X POST http://localhost:3000/api/chat
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"message": "Check remaining requests"}'

# Wait for next hour boundary or restart server to clear windows
# Then test that limits are reset
```

## Architecture Overview

### Core Components

- **Rate Limiter Service**: Implements fixed window algorithm with configurable limits
- **Authentication System**: JWT-based with bcrypt password hashing
- **Permissive Auth Middleware**: Optional authentication for guest/authenticated access
- **AI Service**: Vercel AI SDK integration with comprehensive logging
- **Cleanup Service**: Automatic cleanup of expired rate limit windows

### Directory Structure

```
src/
├── config/              # Configuration files
│   ├── environment.ts   # Environment variables & validation
│   └── inversify.config.ts  # DI container setup
├── constants/           # Application constants
│   └── types.ts        # DI container type definitions
├── controllers/         # Request handlers
│   ├── auth.controller.ts
│   └── chat.controller.ts
├── interfaces/          # TypeScript interfaces
│   ├── *.interface.ts  # Service interfaces
├── middleware/          # Express middleware
│   ├── auth.middleware.ts          # Strict authentication
│   ├── permissive-auth.middleware.ts  # Optional authentication
│   ├── rate-limit.middleware.ts    # Rate limiting
│   └── error.middleware.ts         # Error handling
├── repositories/        # Data access layer
│   └── user.repository.ts
├── routes/             # API route definitions
│   ├── auth.routes.ts
│   └── chat.routes.ts
├── services/           # Business logic
│   ├── ai.service.ts          # AI integration
│   ├── auth.service.ts        # Authentication logic
│   ├── cleanup.service.ts     # Rate limit cleanup
│   └── rate-limiter.service.ts # Rate limiting logic
├── types/              # Type definitions
│   ├── chat.type.ts
│   ├── user.type.ts
│   └── express.d.ts    # Express request extensions
├── utils/              # Utility functions
│   ├── auth.util.ts    # Auth helper functions
│   └── logger.ts       # Winston logger setup
├── validators/         # Input validation
│   ├── auth.validator.ts
│   └── chat.validator.ts
└── server.ts           # Application entry point
```

## Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
npm run typecheck   # Run TypeScript type checking
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Format code with Prettier
npm run format:check # Check code formatting
```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with TypeScript and Prettier rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Lint-staged**: Run linters on staged files only

## Monitoring & Logging

The application uses Winston for structured logging:

- **Request Tracking**: Each request gets a unique ID
- **Performance Metrics**: Response times and AI token usage
- **Rate Limit Events**: Tracking of rate limit hits and resets
- **Error Logging**: Comprehensive error context and stack traces

Log levels: `error`, `warn`, `info`, `debug`

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment | development | No |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRES_IN` | JWT expiration | 7d | No |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | 12 | No |
| `OPENAI_API_KEY` | OpenAI API key | - | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window duration | 3600000 | No |
| `RATE_LIMIT_GUEST_LIMIT` | Guest requests per window | 3 | No |
| `RATE_LIMIT_FREE_LIMIT` | Free user requests per window | 10 | No |
| `RATE_LIMIT_PREMIUM_LIMIT` | Premium user requests per window | 50 | No |
| `RATE_LIMIT_CLEANUP_INTERVAL_MS` | Cleanup service interval | 900000 | No |