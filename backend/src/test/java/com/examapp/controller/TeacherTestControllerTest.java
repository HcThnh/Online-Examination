package com.examapp.controller;

import com.examapp.dto.test.*;
import com.examapp.security.JwtAuthenticationFilter;
import com.examapp.security.JwtUtil;
import com.examapp.service.ExamService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TeacherTestController.class)
@AutoConfigureMockMvc(addFilters = false)
class TeacherTestControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private ExamService examService;
    @MockBean private JwtUtil jwtUtil;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    private static RequestPostProcessor asTeacher() {
        return request -> {
            request.setUserPrincipal(new UsernamePasswordAuthenticationToken(1L, "token",
                    List.of(new SimpleGrantedAuthority("ROLE_TEACHER"))));
            return request;
        };
    }

    @Test
    void createTest_returnsCreated() throws Exception {
        CreateTestRequest request = new CreateTestRequest("Math", "Description", "ABC");
        TestResponse response = new TestResponse(1L, "Math", "Description", "ABC", 1L, Instant.now(), Instant.now());

        when(examService.createTest(eq(1L), any())).thenReturn(response);

        mockMvc.perform(post("/api/teacher/tests").with(asTeacher())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Math"));
    }

    @Test
    void listTests_returnsTestList() throws Exception {
        List<TestSummaryResponse> tests = List.of(
                new TestSummaryResponse(1L, "Math", "ABC", 5, Instant.now())
        );
        when(examService.listTests(1L)).thenReturn(tests);
mockMvc.perform(get("/api/teacher/tests").with(asTeacher()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Math"))
                .andExpect(jsonPath("$[0].questionCount").value(5));
    }

    @Test
    void getTestDetail_returnsDetail() throws Exception {
        TestDetailResponse detail = new TestDetailResponse(
                1L, "Math", "Desc", "ABC", 1L, Instant.now(), Instant.now(), 5, 10, 82.0);
        when(examService.getTestDetail(1L, 1L)).thenReturn(detail);

        mockMvc.perform(get("/api/teacher/tests/1").with(asTeacher()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Math"))
                .andExpect(jsonPath("$.questionCount").value(5))
                .andExpect(jsonPath("$.submissionCount").value(10))
                .andExpect(jsonPath("$.averageScorePercentage").value(82.0));
    }

    @Test
    void updateTest_returnsUpdated() throws Exception {
        CreateTestRequest request = new CreateTestRequest("Updated", "Desc", "ABC");
        TestResponse response = new TestResponse(1L, "Updated", "Desc", "ABC", 1L, Instant.now(), Instant.now());

        when(examService.updateTest(eq(1L), eq(1L), any())).thenReturn(response);

        mockMvc.perform(put("/api/teacher/tests/1").with(asTeacher())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated"));
    }

    @Test
    void deleteTest_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/teacher/tests/1").with(asTeacher()))
                .andExpect(status().isNoContent());

        verify(examService).deleteTest(1L, 1L);
    }

    @Test
    void createTest_emptyTitle_returnsBadRequest() throws Exception {
        String json = """
                {"title": "", "description": "Desc", "passcode": "ABC"}
                """;

        mockMvc.perform(post("/api/teacher/tests").with(asTeacher())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }
}