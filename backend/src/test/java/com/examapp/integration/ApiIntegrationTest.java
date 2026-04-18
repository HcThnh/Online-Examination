package com.examapp.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

import javax.sql.DataSource;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.Statement;
import java.time.Duration;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-end API test: spins up a real Postgres via Testcontainers, lets
 * Hibernate create the schema, loads backend/db/seed-demo.sql, and hits the
 * actual HTTP endpoints with java.net.http.HttpClient to verify responses.
 *
 * This covers the same surface the seed-demo.sh + manual curl flow would.
 * HttpClient is preferred over TestRestTemplate here because the JDK version
 * handles 4xx responses cleanly; TestRestTemplate's HttpURLConnection backend
 * throws HttpRetryException on a POST that receives 401.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ApiIntegrationTest {

    // Eagerly started so the container is ready before @DynamicPropertySource
    // evaluates its suppliers. Ryuk tears the container down at JVM exit.
    static final PostgreSQLContainer<?> POSTGRES;
    static {
        POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
                .withDatabaseName("examdb")
                .withUsername("examuser")
                .withPassword("exampass");
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void overrideDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create");
    }

    @LocalServerPort private int port;
    @Autowired private DataSource dataSource;
    @Autowired private ObjectMapper mapper;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private String aliceToken;

    @BeforeAll
    void seedDatabase() throws Exception {
        String sql = Files.readString(Path.of("db/seed-demo.sql"));
        try (Connection conn = dataSource.getConnection();
             Statement st = conn.createStatement()) {
            st.execute(sql);
        }
        aliceToken = login("alice@example.com", "demo1234");
    }

    // --- auth ---------------------------------------------------------------

    @Test
    @DisplayName("POST /api/auth/login with a seeded teacher returns a JWT and TEACHER role")
    void login_seededTeacher_returnsJwtWithTeacherRole() throws Exception {
        HttpResponse<String> resp = postJson("/api/auth/login",
                Map.of("email", "alice@example.com", "password", "demo1234"));

        assertEquals(200, resp.statusCode());
        JsonNode body = mapper.readTree(resp.body());
        assertTrue(body.get("token").asText().startsWith("eyJ"));
        assertEquals("Alice Anderson", body.get("user").get("name").asText());
        assertEquals("TEACHER", body.get("user").get("role").asText());
    }

    @Test
    @DisplayName("POST /api/auth/login with wrong password returns 401 with error message")
    void login_wrongPassword_returns401WithMessage() throws Exception {
        HttpResponse<String> resp = postJson("/api/auth/login",
                Map.of("email", "alice@example.com", "password", "wrong"));

        assertEquals(401, resp.statusCode());
        assertEquals("Invalid credentials", mapper.readTree(resp.body()).get("error").asText());
    }

    // --- security entry point / access denied handler -----------------------

    @Test
    @DisplayName("Secured endpoint without a token returns 401 with auth-required message")
    void secured_noToken_returns401AuthRequired() throws Exception {
        HttpResponse<String> resp = http.send(
                HttpRequest.newBuilder(URI.create(url("/api/teacher/tests"))).GET().build(),
                HttpResponse.BodyHandlers.ofString());

        assertEquals(401, resp.statusCode());
        assertEquals("Bearer", resp.headers().firstValue("WWW-Authenticate").orElse(null));
        assertEquals("Authentication required. Please provide a valid JWT token",
                mapper.readTree(resp.body()).get("error").asText());
    }

    @Test
    @DisplayName("Secured endpoint with an invalid token returns 401 with invalid-token message")
    void secured_invalidToken_returns401InvalidToken() throws Exception {
        HttpResponse<String> resp = authedGet("/api/teacher/tests", "not-a-real-jwt");

        assertEquals(401, resp.statusCode());
        assertEquals("Invalid or expired authentication token",
                mapper.readTree(resp.body()).get("error").asText());
    }

    // --- teacher read endpoints --------------------------------------------

    @Test
    @DisplayName("GET /api/teacher/tests as Alice lists her two seeded tests")
    void listTests_asAlice_returnsHerTwoTests() throws Exception {
        HttpResponse<String> resp = authedGet("/api/teacher/tests", aliceToken);

        assertEquals(200, resp.statusCode());
        JsonNode body = mapper.readTree(resp.body());
        assertEquals(2, body.size());
        boolean hasMath = false, hasGeo = false;
        for (JsonNode t : body) {
            if ("Math Basics".equals(t.get("title").asText())) {
                hasMath = true;
                assertEquals("MATH101", t.get("passcode").asText());
                assertEquals(5, t.get("questionCount").asInt());
            }
            if ("World Geography".equals(t.get("title").asText())) {
                hasGeo = true;
                assertEquals("GEO202", t.get("passcode").asText());
            }
        }
        assertTrue(hasMath, "expected Math Basics in teacher test list");
        assertTrue(hasGeo, "expected World Geography in teacher test list");
    }

    @Test
    @DisplayName("GET /api/teacher/tests/{id} as Alice returns her own test details")
    void getTestDetails_asAlice_returnsMathBasics() throws Exception {
        HttpResponse<String> resp = authedGet("/api/teacher/tests/1", aliceToken);

        assertEquals(200, resp.statusCode());
        JsonNode body = mapper.readTree(resp.body());
        assertEquals("Math Basics", body.get("title").asText());
        assertEquals(5, body.get("questionCount").asInt());
        assertEquals(2, body.get("submissionCount").asLong());
    }

    @Test
    @DisplayName("GET /api/teacher/tests/{id} as Alice for Bob's test returns 403 ForbiddenException")
    void getTestDetails_asAlice_forBobsTest_returns403() throws Exception {
        HttpResponse<String> resp = authedGet("/api/teacher/tests/3", aliceToken);

        assertEquals(403, resp.statusCode());
        assertEquals("Not authorized to access this test",
                mapper.readTree(resp.body()).get("error").asText());
    }

    @Test
    @DisplayName("GET /api/teacher/tests/{id}/statistics returns stats that match the seeded attempts")
    void getStatistics_returnsSeededValues() throws Exception {
        HttpResponse<String> resp = authedGet("/api/teacher/tests/1/statistics", aliceToken);

        assertEquals(200, resp.statusCode());
        JsonNode body = mapper.readTree(resp.body());
        // Seeded attempts: Charlie 50/50, Diana 30/50 → avg=40, high=50, low=30, passRate=100%.
        assertEquals(2, body.get("totalAttempts").asLong());
        assertEquals(50, body.get("highestScore").asInt());
        assertEquals(30, body.get("lowestScore").asInt());
        assertEquals(40.0, body.get("averageScore").asDouble());
        assertEquals(100.0, body.get("passRate").asDouble());
    }

    @Test
    @DisplayName("GET /api/teacher/tests/{id}/question-analysis returns one entry per question")
    void getQuestionAnalysis_returnsFiveQuestions() throws Exception {
        HttpResponse<String> resp = authedGet("/api/teacher/tests/1/question-analysis", aliceToken);

        assertEquals(200, resp.statusCode());
        JsonNode body = mapper.readTree(resp.body());
        assertEquals(5, body.size());
        assertEquals("What is 7 + 5?", body.get(0).get("questionText").asText());
        assertEquals(100.0, body.get(0).get("correctRate").asDouble());
        assertEquals(2, body.get(0).get("totalAnswers").asLong());
    }

    @Test
    @DisplayName("GET /api/teacher/tests/{id}/results?search=charlie finds Charlie's attempt")
    void getResults_withSearch_findsCharlie() throws Exception {
        HttpResponse<String> resp = authedGet("/api/teacher/tests/1/results?search=charlie", aliceToken);

        assertEquals(200, resp.statusCode());
        JsonNode body = mapper.readTree(resp.body());
        assertEquals(1, body.get("totalStudents").asLong());
        JsonNode first = body.get("results").get(0);
        assertEquals("Charlie Chen", first.get("studentName").asText());
        assertEquals(50, first.get("score").asInt());
        assertEquals(100.0, first.get("percentage").asDouble());
    }

    // --- role mismatch ------------------------------------------------------

    @Test
    @DisplayName("Student token hitting a teacher endpoint returns 403 with permission message")
    void studentToken_onTeacherEndpoint_returns403() throws Exception {
        String studentToken = accessTestAsStudent("MATH101", "Charlie Chen").get("token").asText();
        HttpResponse<String> resp = authedGet("/api/teacher/tests", studentToken);

        assertEquals(403, resp.statusCode());
        assertEquals("You do not have permission to access this resource",
                mapper.readTree(resp.body()).get("error").asText());
    }

    // --- student flow -------------------------------------------------------

    @Test
    @DisplayName("POST /api/student/access with a valid passcode returns a student token")
    void studentAccess_withValidPasscode_returnsToken() throws Exception {
        JsonNode body = accessTestAsStudent("MATH101", "Charlie Chen");

        assertTrue(body.get("token").asText().startsWith("eyJ"));
        assertEquals("Math Basics", body.get("testTitle").asText());
        assertEquals(1L, body.get("testId").asLong());
    }

    @Test
    @DisplayName("POST /api/student/access with an invalid passcode returns 404 not found")
    void studentAccess_invalidPasscode_returns404() throws Exception {
        HttpResponse<String> resp = postJson("/api/student/access",
                Map.of("passcode", "NOPE999", "studentName", "Nobody"));

        assertEquals(404, resp.statusCode());
        assertEquals("Invalid passcode", mapper.readTree(resp.body()).get("error").asText());
    }

    @Test
    @DisplayName("Student view of the test hides the isCorrect flag on options")
    void studentGetQuestions_doesNotLeakIsCorrect() throws Exception {
        String studentToken = accessTestAsStudent("MATH101", "Charlie Chen").get("token").asText();
        HttpResponse<String> resp = authedGet("/api/student/tests/1/questions", studentToken);

        assertEquals(200, resp.statusCode());
        JsonNode body = mapper.readTree(resp.body());
        assertEquals(5, body.get("questions").size());
        JsonNode firstOption = body.get("questions").get(0).get("options").get(0);
        assertFalse(firstOption.has("isCorrect"), "student response must not expose isCorrect");
        assertNotNull(firstOption.get("optionText"));
    }

    // --- helpers ------------------------------------------------------------

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    private HttpResponse<String> postJson(String path, Map<String, Object> body) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create(url(path)))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                .build();
        return http.send(req, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> authedGet(String path, String token) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create(url(path)))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();
        return http.send(req, HttpResponse.BodyHandlers.ofString());
    }

    private String login(String email, String password) throws Exception {
        HttpResponse<String> resp = postJson("/api/auth/login",
                Map.of("email", email, "password", password));
        assertEquals(200, resp.statusCode(), "login failed for " + email + ": " + resp.body());
        return mapper.readTree(resp.body()).get("token").asText();
    }

    private JsonNode accessTestAsStudent(String passcode, String name) throws Exception {
        HttpResponse<String> resp = postJson("/api/student/access",
                Map.of("passcode", passcode, "studentName", name));
        assertEquals(200, resp.statusCode(), "student access failed: " + resp.body());
        return mapper.readTree(resp.body());
    }
}
