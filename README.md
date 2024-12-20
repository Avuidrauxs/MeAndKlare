# MeAndKlare

A robust TypeScript-based service for classifying messages, managing conversation flows, and maintaining context in mental health support conversations. Built with Express.js, Redis, and LangChain integration.

## 🚀 Features

- Message classification (Normal, FAQ, Suicide Risk)
- Conversation flow management
- Context maintenance with Redis
- OpenAI/Anthropic/Groq integration via LangChain
- TypeScript implementation
- Docker support
- Comprehensive testing suite

## 📋 Prerequisites

- Node.js 18+
- Redis
- Docker and Docker Compose (optional)
- OpenAI/Anthropic/Groq API key

## 🛠️ Installation

### Local Development Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd MeAndKlare
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Configuration**

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configurations
nano .env
```

Required environment variables for LLM usage:

```env
OPENAI_API_KEY= # You can get API key here: https://platform.openai.com/api-keys
# OR
ANTHROPIC_API_KEY= # You can get API key here: https://console.anthropic.com/
# OR
GROQ_API_KEY= # You can get API Key here: https://console.groq.com/keys
REDIS_HOST=redis
REDIS_PORT=6379
PORT=3000
LANGCHAIN_TRACING_V2="true"
LANGCHAIN_API_KEY= # You can get API key here: https://docs.smith.langchain.com/administration/how_to_guides/organization_management/create_account_api_key
OPENAI_MODEL="gpt-4o-mini"
# OR
ANTHROPIC_MODEL=claude-3-5-sonnet-20240620
LLM_TEMP= 0
JWT_SECRET=secret
MAX_TOKENS=2000
```

If you don't have the API keys to use any of these LLms then the config `NO_LLM` will be set to true and then 
the fallback mechanism to handle offline prompts will be used


4. **Start Redis** (if not using Docker)

```bash
# Install Redis (Ubuntu)
sudo apt-get install redis-server

# Start Redis
sudo service redis-server start
```

5. **Build and Run**

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### 🐳 Docker Setup

1. **Build and run with Docker Compose**

```bash
# Start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

2. **Stop services**

```bash
docker-compose down
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- [relative path to file]
```

## 📚 API Documentation

### Authentication

All conversational AI endpoints require JWT authentication via Bearer token in the Authorization header.

### Endpoints

#### Register User

**URL:** `/api/v1/user/register`

**Method:** `POST`

**Description:** Registers a new user.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

- `200 OK` on successful registration
  ```json
  {
    "message": "User registered successfully"
  }
  ```
- `400 Bad Request` if the request body is invalid
  ```json
  {
    "message": "Invalid request body"
  }
  ```

#### Login User

**URL:** `/api/v1/user/login`

**Method:** `POST`

**Description:** Logs in an existing user and returns a JWT token.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

- `200 OK` on successful login
  ```json
  {
    "token": "string"
  }
  ```
- `401 Unauthorized` if the credentials are invalid
  ```json
  {
    "message": "Invalid credentials"
  }
  ```

#### Send Message

```http
POST /api/v1/message/sendMessage
Content-Type: application/json
Authorization: Bearer <token>

{
  "input": "Hi, I am happy today"
}
```

#### Initiate Check-In

```http
POST /api/v1/message/initiateCheckin
Content-Type: application/json
Authorization: Bearer <token>

```

#### Retrieve Context

```http
GET /api/v1/context/retrieveContext
Authorization: Bearer <token>
```

#### Update Context

```http
PUT /api/v1/context/updateContext
Content-Type: application/json
Authorization: Bearer <token>

{
    "updates": {
            "mood": "happy",
            "flow": "CHECK_IN"
            }
}
```

### Postman Collection

Can be downloaded from [here](https://drive.google.com/file/d/17zrP4ZcN9H90klOj80D2dtRLigQ8trnp/view?usp=sharing)

## 🔧 Configuration

### TypeScript Configuration

Key configurations in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Jest Configuration

Key configurations in `jest.config.ts`:

```typescript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1'
  }
}
```

### Production Considerations

- Set strong JWT secret
- Configure proper Redis URL
- Set NODE_ENV to production
- Use proper SSL/TLS certificates
- Configure proper logging
- Set up monitoring

## 🔍 Monitoring

The service includes:

- Error logging
- Request logging
- Performance metrics
- Health checks

Access monitoring endpoints:

```http
GET /health
GET /metrics
```

## 🛡️ Security

- JWT authentication
- Rate limiting
- Helmet security headers
- Sanitizing Input
- Check if Inputs exceed max tokens
- Error handling

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Known Issues

- Didn't populate a lot of scenarios for offline LLM usage
- Chat_history has no limits for now
- Test coverage not 100%

---

Made with ❤️ by [Audax/Me&Klare]
