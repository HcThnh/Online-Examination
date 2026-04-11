package com.examapp.controller;

import com.examapp.dto.MessageResponse;
import com.examapp.dto.question.*;
import com.examapp.security.JwtAuthenticationFilter;
import com.examapp.security.JwtUtil;
import com.examapp.service.QuestionService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TeacherQuestionController.class)
@AutoConfigureMockMvc(addFilters = false)
class TeacherQuestionControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private QuestionService questionService;
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
    void addQuestion_returnsCreated() throws Exception {
        QuestionRequest request = new QuestionRequest("What is 2+2?", 10, 1, List.of(
                new QuestionRequest.OptionRequest("3", false, 1),
                new QuestionRequest.OptionRequest("4", true, 2)
        ));
        QuestionResponse response = new QuestionResponse(1L, "What is 2+2?", 10, 1, List.of(
                new QuestionResponse.OptionResponse(1L, "3", false, 1),
                new QuestionResponse.OptionResponse(2L, "4", true, 2)
        ));

        when(questionService.addQuestion(eq(1L), eq(5L), any())).thenReturn(response);

        mockMvc.perform(post("/api/teacher/tests/5/questions").with(asTeacher())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.questionText").value("What is 2+2?"))
                .andExpect(jsonPath("$.options.length()").value(2));
    }

    @Test
    void getQuestions_returnsList() throws Exception {
        List<QuestionResponse> questions = List.of(
                new QuestionResponse(1L, "Q1", 10, 1, List.of())
        );
        when(questionService.getQuestions(1L, 5L)).thenReturn(questions);

        mockMvc.perform(get("/api/teacher/tests/5/questions").with(asTeacher()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].questionText").value("Q1"));
    }

    @Test
    void deleteQuestion_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/teacher/tests/5/questions/1").with(asTeacher()))
                .andExpect(status().isNoContent());

        verify(questionService).deleteQuestion(1L, 5L, 1L);
    }

    @Test
    void reorderQuestions_returnsMessage() throws Exception {
        ReorderRequest request = new ReorderRequest(List.of(3L, 1L, 2L));
        when(questionService.reorderQuestions(eq(1L), eq(5L), any())).thenReturn(new MessageResponse("Questions reordered"));

        mockMvc.perform(put("/api/teacher/tests/5/questions/reorder").with(asTeacher())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Questions reordered"));
    }
}
