# Online Examination Application - Backend

REST API for the Online Examination Application built with Spring Boot. Teachers create and manage tests, students take tests via passcode and get auto-graded results.

## Prerequisites

- **Java 21** - `brew install openjdk@21` (macOS) or download from [Adoptium](https://adoptium.net/)
- **Docker** - for running PostgreSQL

Maven is included via the wrapper (`./mvnw`), no separate install needed.

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Run the application
./mvnw spring-boot:run

# 3. Open Swagger UI
open http://localhost:8080/swagger-ui.html
```

The app starts on port **8080** and auto-creates all database tables on first run.

## Running with a specific Java version

If Java 21 isn't your default, set `JAVA_HOME`:

```bash
# macOS with Homebrew
JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./mvnw spring-boot:run

# Or export it for the session
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
./mvnw spring-boot:run
```

## Database

PostgreSQL runs via Docker Compose with these defaults:

| Setting  | Value     |
|----------|-----------|
| Host     | localhost |
| Port     | 5432      |
| Database | examdb    |
| User     | examuser  |
| Password | exampass  |

```bash
# Start
docker compose up -d

# Stop (keeps data)
docker compose down

# Stop and delete all data
docker compose down -v
```

Override via environment variables:

```bash
backend\README.md
D:\Documents\BK4\cnpmnc\lab\online-examination-application\backend\README.md
DB_URL=jdbc:postgresql://localhost:5432/mydb \
DB_USERNAME=myuser \
DB_PASSWORD=mypass \
./mvnw spring-boot:run
```

## Configuration

All settings can be overridden with environment variables:

| Variable           | Default                                    | Description          |
|--------------------|--------------------------------------------|----------------------|
| `DB_URL`           | `jdbc:postgresql://localhost:5432/examdb`  | JDBC connection URL  |
| `DB_USERNAME`      | `examuser`                                 | Database user        |
| `DB_PASSWORD`      | `exampass`                                 | Database password    |
| `JWT_SECRET`       | (auto-generated)                           | Base64-encoded key   |
| `JWT_EXPIRATION_MS`| `86400000` (24h)                           | Token expiry in ms   |

## Running Tests

Tests use an in-memory H2 database, no PostgreSQL needed:

```bash
./mvnw test
```

## API Overview

Swagger UI is available at `/swagger-ui.html` when the app is running. Below is a summary:

### Authentication (public)

| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| POST   | `/api/auth/register` | Register a teacher       |
| POST   | `/api/auth/login`    | Login, returns JWT token |

### Teacher Endpoints (requires JWT with role TEACHER)

| Method | Endpoint                                        | Description             |
|--------|-------------------------------------------------|-------------------------|
| POST   | `/api/teacher/tests`                            | Create a test           |
| GET    | `/api/teacher/tests`                            | List teacher's tests    |
| PUT    | `/api/teacher/tests/{testId}`                   | Update a test           |
| DELETE | `/api/teacher/tests/{testId}`                   | Delete a test           |
| POST   | `/api/teacher/tests/{testId}/questions`          | Add a question          |
| GET    | `/api/teacher/tests/{testId}/questions`          | List questions          |
| PUT    | `/api/teacher/tests/{testId}/questions/{qId}`    | Update a question       |
| DELETE | `/api/teacher/tests/{testId}/questions/{qId}`    | Delete a question       |
| PUT    | `/api/teacher/tests/{testId}/questions/reorder`  | Reorder questions       |
| GET    | `/api/teacher/tests/{testId}/results`            | Class results (paged)   |
| GET    | `/api/teacher/tests/{testId}/statistics`         | Class statistics        |
| GET    | `/api/teacher/tests/{testId}/question-analysis`  | Per-question analysis   |
| GET    | `/api/teacher/tests/{testId}/results/export`     | Export CSV or Excel     |

### Student Endpoints

| Method | Endpoint                                | Auth     | Description                 |
|--------|-----------------------------------------|----------|-----------------------------|
| POST   | `/api/student/access`                   | Public   | Access test via passcode    |
| GET    | `/api/student/tests/{testId}/questions` | STUDENT  | Get questions (no answers)  |
| POST   | `/api/student/tests/{testId}/submit`    | STUDENT  | Submit and auto-grade       |
| GET    | `/api/student/attempts/{attemptId}`     | STUDENT  | View detailed result        |
| GET    | `/api/student/my-results`               | STUDENT  | List past attempts          |

### Example: Register and Login

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"password123"}'

# Use the returned token for teacher endpoints
curl http://localhost:8080/api/teacher/tests \
  -H "Authorization: Bearer <token>"
```

## Project Structure

```
src/main/java/com/examapp/
  config/        SecurityConfig, OpenApiConfig (Swagger)
  controller/    REST controllers (Auth, Test, Question, Student, Result)
  dto/           Request/response records
  entity/        JPA entities (User, Exam, Question, AnswerOption, TestAttempt, StudentAnswer)
  enums/         Role enum (TEACHER, STUDENT)
  exception/     Global exception handler and custom exceptions
  repository/    Spring Data JPA repositories
  security/      JWT utility and authentication filter
  service/       Business logic services
```

## Tech Stack

- Java 21, Spring Boot 3.3.5
- Spring Security with JWT authentication
- Spring Data JPA with PostgreSQL
- Springdoc OpenAPI (Swagger UI)
- Apache POI for Excel export
- JUnit 5 + Mockito for testing
