# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
# Copy package files first for better caching
COPY frontend/package*.json ./
RUN npm install
# Copy rest of the frontend source
COPY frontend/ ./
# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
WORKDIR /app/backend
# Copy pom.xml for dependency caching
COPY backend/pom.xml ./
RUN mvn dependency:go-offline
# Copy backend source and configuration
COPY backend/src ./src
COPY backend/checkstyle.xml ./

# Copy frontend build into backend static resources
COPY --from=frontend-build /app/frontend/dist/ ./src/main/resources/static/

# Build the JAR (no clean needed, fresh container)
RUN mvn package -DskipTests

# Stage 3: Runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
# Render uses the PORT environment variable, default to 8080
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dserver.port=${PORT}", "app.jar"]
