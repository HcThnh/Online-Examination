package com.examapp.controller;

import com.examapp.dto.result.*;
import com.examapp.security.JwtAuthenticationFilter;
import com.examapp.security.JwtUtil;
import com.examapp.service.ExportService;
import com.examapp.service.ResultService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TeacherResultController.class)
@AutoConfigureMockMvc(addFilters = false)
class TeacherResultControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private ResultService resultService;
    @MockBean private ExportService exportService;
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
    void getClassResults_returnsPaginatedResults() throws Exception {
        ClassResultsResponse response = new ClassResultsResponse(1, 0, 20, List.of(
                new ClassResultsResponse.StudentResultDto(1L, "Alice", 80, 100, 80.0, Instant.now())
        ));
        when(resultService.getClassResults(eq(1L), eq(10L), anyString(), anyString(), isNull(), eq(0), eq(20)))
                .thenReturn(response);

        mockMvc.perform(get("/api/teacher/tests/10/results").with(asTeacher()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalStudents").value(1))
                .andExpect(jsonPath("$.results[0].studentName").value("Alice"));
    }

    @Test
    void getStatistics_returnsStats() throws Exception {
        List<ClassStatisticsResponse.DistributionBucket> dist = List.of(
                new ClassStatisticsResponse.DistributionBucket("80-90%", 5)
        );
        ClassStatisticsResponse response = new ClassStatisticsResponse(30, 75.5, 98, 32, 75.5, 83.3, 50, dist);
        when(resultService.getStatistics(1L, 10L)).thenReturn(response);

        mockMvc.perform(get("/api/teacher/tests/10/statistics").with(asTeacher()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAttempts").value(30))
                .andExpect(jsonPath("$.averageScore").value(75.5));
    }

    @Test
    void getQuestionAnalysis_returnsAnalysis() throws Exception {
        List<QuestionAnalysisResponse> analysis = List.of(
                new QuestionAnalysisResponse(1L, "Q1", 10, 73.3, 30, List.of())
        );
        when(resultService.getQuestionAnalysis(1L, 10L)).thenReturn(analysis);

        mockMvc.perform(get("/api/teacher/tests/10/question-analysis").with(asTeacher()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].correctRate").value(73.3));
    }

    @Test
    void exportResults_csv_callsExportService() throws Exception {
        mockMvc.perform(get("/api/teacher/tests/10/results/export?format=csv").with(asTeacher()))
                .andExpect(status().isOk());

        verify(exportService).exportCsv(eq(1L), eq(10L), any());
    }

    @Test
    void exportResults_xlsx_callsExportService() throws Exception {
        mockMvc.perform(get("/api/teacher/tests/10/results/export?format=xlsx").with(asTeacher()))
                .andExpect(status().isOk());

        verify(exportService).exportExcel(eq(1L), eq(10L), any());
    }
}
