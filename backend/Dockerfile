# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY checkstyle.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Setup runtime environment
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Port mà Spring Boot expose (mặc định là 8080)
EXPOSE 8080 
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
