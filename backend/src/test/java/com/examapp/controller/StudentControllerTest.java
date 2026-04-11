package com.examapp.controller;

import com.examapp.dto.student.*;
import com.examapp.security.JwtAuthenticationFilter;
import com.examapp.security.JwtUtil;
import com.examapp.service.StudentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StudentController.class)
@AutoConfigureMockMvc(addFilters = false)
class StudentControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private StudentService studentService;
    @MockBean private JwtUtil jwtUtil;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    private static RequestPostProcessor asStudent() {
        return request -> {
            request.setUserPrincipal(new UsernamePasswordAuthenticationToken(5L, "student-token",
                    List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))));
            return request;
        };
    }

    @Test
    void accessTest_returnsToken() throws Exception {
        StudentAccessRequest request = new StudentAccessRequest("CODE", "Alice");
        StudentAccessResponse response = new StudentAccessResponse("jwt", 10L, "Math Test", 5L);

        when(studentService.accessTest(any())).thenReturn(response);

        mockMvc.perform(post("/api/student/access")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt"))
                .andExpect(jsonPath("$.testId").value(10));
    }

    @Test
    void getTestQuestions_returnsQuestions() throws Exception {
        when(jwtUtil.getTestId("student-token")).thenReturn(10L);

        StudentTestResponse response = new StudentTestResponse("Math", "Desc", 1, List.of(
                new StudentTestResponse.StudentQuestionDto(1L, "Q1", 10, 1, List.of(
                        new StudentTestResponse.StudentOptionDto(1L, "A", 1),
                        new StudentTestResponse.StudentOptionDto(2L, "B", 2)
                ))
        ));
        when(studentService.getTestQuestions(10L)).thenReturn(response);

        mockMvc.perform(get("/api/student/tests/10/questions").with(asStudent()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.testTitle").value("Math"))
                .andExpect(jsonPath("$.questions[0].options.length()").value(2));
    }

    @Test
    void submitTest_returnsResult() throws Exception {
        when(jwtUtil.getTestId("student-token")).thenReturn(10L);

        SubmitTestRequest request = new SubmitTestRequest(List.of(
                new SubmitTestRequest.AnswerDto(1L, 2L)
        ));
        SubmitResultResponse response = new SubmitResultResponse(1L, 10, 10, 100.0, Instant.now());
        when(studentService.submitTest(eq(5L), eq(10L), any())).thenReturn(response);

        mockMvc.perform(post("/api/student/tests/10/submit").with(asStudent())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.score").value(10))
                .andExpect(jsonPath("$.percentage").value(100.0));
    }

    @Test
    void getPastResults_returnsList() throws Exception {
        List<PastAttemptResponse> results = List.of(
                new PastAttemptResponse(1L, "Math", 80, 100, 80.0, Instant.now())
        );
        when(studentService.getPastAttempts(5L)).thenReturn(results);

        mockMvc.perform(get("/api/student/my-results").with(asStudent()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].testTitle").value("Math"))
                .andExpect(jsonPath("$[0].score").value(80));
    }
}
