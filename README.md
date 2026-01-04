# Smart Brain API

A RESTful API backend for a face recognition application that uses Clarifai's face detection model to detect faces in images. Built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **User Authentication**: Secure registration and signin with bcrypt password hashing
- **Face Detection**: Integration with Clarifai API to detect faces in images
- **User Profiles**: Retrieve user information and track face detection entries
- **Entry Counter**: Track how many times a user has detected faces

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Architecture Diagram](#architecture-diagram)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Project Structure](#project-structure)

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (hosted on Render)
- **ORM**: Knex.js
- **Security**: bcrypt for password hashing
- **External API**: Clarifai REST API for face detection
- **Deployment**: Render

## 📡 API Endpoints

### `GET /`
Health check endpoint.

**Response:**
```json
"success"
```

### `POST /register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "entries": 0,
  "joined": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - "incorrect form submission" (missing fields)
- `400` - "email already exists" (duplicate email)
- `400` - "unable to register" (other errors)

### `POST /signin`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "entries": 5,
  "joined": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - "incorrect form submission" (missing fields)
- `400` - "wrong credentials" (invalid email/password)

### `GET /profile/:id`
Get user profile by ID.

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "entries": 5,
  "joined": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - "user not found"

### `PUT /image`
Increment user's face detection entry count.

**Request Body:**
```json
{
  "id": 1
}
```

**Response:**
```json
6
```

**Error Responses:**
- `400` - "unable to update entries"

### `POST /imageurl`
Detect faces in an image using Clarifai API.

**Request Body:**
```json
{
  "input": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "outputs": [
    {
      "id": "...",
      "status": {...},
      "created_at": "...",
      "model": {...},
      "data": {
        "regions": [
          {
            "region_info": {
              "bounding_box": {
                "left_col": 0.1,
                "top_row": 0.2,
                "right_col": 0.9,
                "bottom_row": 0.8
              }
            }
          }
        ]
      }
    }
  ]
}
```

**Error Responses:**
- `400` - "missing input field"
- `400` - Clarifai API error message

## 🗄 Database Schema

### `login` Table
Stores authentication credentials.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| email | TEXT | NOT NULL, UNIQUE |
| hash | TEXT | (bcrypt hashed password) |

### `users` Table
Stores user profile information.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| email | TEXT | NOT NULL, UNIQUE |
| name | VARCHAR(100) | |
| entries | BIGINT | DEFAULT 0 |
| joined | TIMESTAMP | NOT NULL |

## 🏗 Architecture Diagram

### System Architecture

```mermaid
graph TB
    Client[Client/Frontend<br/>React App<br/>Port 3001]
    API[Smart Brain API<br/>Express Server<br/>Port 3000/10000]
    
    subgraph Controllers["API Controllers"]
        Register[Register Controller]
        Signin[Signin Controller]
        Profile[Profile Controller]
        Image[Image Controller]
        ImageClarifai[Image Controller<br/>Clarifai]
    end
    
    Knex[Knex.js<br/>Query Builder]
    
    subgraph Database["PostgreSQL Database<br/>Render PostgreSQL"]
        LoginTable[(login table<br/>id, email, hash)]
        UsersTable[(users table<br/>id, email, name<br/>entries, joined)]
    end
    
    Clarifai[Clarifai API<br/>Face Detection<br/>api.clarifai.com]
    
    Client -->|HTTP Requests| API
    API --> Register
    API --> Signin
    API --> Profile
    API --> Image
    API --> ImageClarifai
    
    Register --> Knex
    Signin --> Knex
    Profile --> Knex
    Image --> Knex
    
    Knex --> Database
    Database --> LoginTable
    Database --> UsersTable
    
    ImageClarifai -->|REST API Call| Clarifai
    
    style Client fill:#e1f5ff
    style API fill:#fff4e1
    style Database fill:#e8f5e9
    style Clarifai fill:#fce4ec
```

### Registration Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Register
    participant bcrypt
    participant DB as PostgreSQL
    
    Client->>API: POST /register<br/>{email, name, password}
    API->>Register: handleRegister()
    Register->>bcrypt: hashSync(password, 10)
    bcrypt-->>Register: hash
    Register->>DB: BEGIN TRANSACTION
    Register->>DB: INSERT INTO login<br/>(hash, email)
    DB-->>Register: email
    Register->>DB: INSERT INTO users<br/>(email, name, joined)
    DB-->>Register: user object
    Register->>DB: COMMIT
    Register-->>API: user object
    API-->>Client: 200 OK<br/>{id, email, name, entries, joined}
```

### Signin Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Signin
    participant bcrypt
    participant DB as PostgreSQL
    
    Client->>API: POST /signin<br/>{email, password}
    API->>Signin: handleSignin()
    Signin->>DB: SELECT hash FROM login<br/>WHERE email = ?
    DB-->>Signin: hash
    Signin->>bcrypt: compare(password, hash)
    bcrypt-->>Signin: isValid (true/false)
    
    alt Password Valid
        Signin->>DB: SELECT * FROM users<br/>WHERE email = ?
        DB-->>Signin: user object
        Signin-->>API: user object
        API-->>Client: 200 OK<br/>{id, email, name, entries, joined}
    else Password Invalid
        Signin-->>API: error
        API-->>Client: 400 Bad Request<br/>"wrong credentials"
    end
```

### Face Detection Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant ImageController
    participant Clarifai
    participant DB as PostgreSQL
    
    Client->>API: POST /imageurl<br/>{input: imageUrl}
    API->>ImageController: handleApiCall()
    ImageController->>Clarifai: POST /models/face-detection/outputs<br/>{image: {url}}
    Clarifai-->>ImageController: face detection data<br/>{regions, bounding_box}
    ImageController-->>API: face detection result
    API-->>Client: 200 OK<br/>{outputs: [{data: {regions: [...]}}]}
    
    Client->>API: PUT /image<br/>{id: userId}
    API->>ImageController: handleImage()
    ImageController->>DB: UPDATE users<br/>SET entries = entries + 1<br/>WHERE id = ?
    DB-->>ImageController: new entries count
    ImageController-->>API: entries count
    API-->>Client: 200 OK<br/>entries count
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database (or Render PostgreSQL)
- Clarifai API key (PAT)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-brain-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file or set environment variables in your deployment platform:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   PAT=your_clarifai_pat_token
   PORT=3000
   ```

4. **Run the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PAT` | Clarifai Personal Access Token | Yes |
| `PORT` | Server port (default: 10000) | No |

## 📁 Project Structure

```
smart-brain-api/
├── controllers/
│   ├── image.js      # Face detection & entry counter
│   ├── profile.js    # User profile retrieval
│   ├── register.js   # User registration
│   └── signin.js     # User authentication
├── node_modules/
├── package.json
├── server.js         # Main server file & routes
└── README.md
```

## 🔒 Security Features

- **Password Hashing**: Uses bcrypt with 10 salt rounds
- **SQL Injection Protection**: Knex.js query builder prevents SQL injection
- **CORS**: Enabled for cross-origin requests
- **Input Validation**: Basic validation on all endpoints
- **SSL/TLS**: Database connections use SSL

## 🚢 Deployment

This API is configured to run on Render. The server requires:
- `DATABASE_URL` environment variable (provided by Render PostgreSQL)
- `PAT` environment variable (Clarifai API key)
- `PORT` environment variable (automatically set by Render)

## 📝 Notes

- The server will not start without `DATABASE_URL` set (configured for Render deployment)
- All passwords are hashed using bcrypt before storage
- Face detection uses Clarifai's face-detection model
- User entries are tracked per face detection request

## 👤 Author

elenaScripts

## 📄 License

ISC
