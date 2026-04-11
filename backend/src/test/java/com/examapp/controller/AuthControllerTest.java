package com.examapp.controller;

import com.examapp.dto.auth.*;
import com.examapp.exception.DuplicateResourceException;
import com.examapp.exception.UnauthorizedException;
import com.examapp.security.JwtAuthenticationFilter;
import com.examapp.security.JwtUtil;
import com.examapp.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private AuthService authService;
    @MockBean private JwtUtil jwtUtil;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void register_returnsCreated() throws Exception {
        RegisterRequest request = new RegisterRequest("John", "john@test.com", "password123");
        RegisterResponse response = new RegisterResponse(1L, "John", "john@test.com", "TEACHER");

        when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("John"))
                .andExpect(jsonPath("$.role").value("TEACHER"));
    }

    @Test
    void register_duplicateEmail_returnsBadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest("John", "john@test.com", "password123");
        when(authService.register(any())).thenThrow(new DuplicateResourceException("Email already exists"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already exists"));
    }

    @Test
    void register_invalidEmail_returnsBadRequest() throws Exception {
        String json = """
                {"name": "John", "email": "not-an-email", "password": "password123"}
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_shortPassword_returnsBadRequest() throws Exception {
        String json = """
                {"name": "John", "email": "john@test.com", "password": "short"}
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_returnsToken() throws Exception {
        LoginRequest request = new LoginRequest("john@test.com", "password123");
        AuthResponse response = new AuthResponse("jwt-token",
                new AuthResponse.UserDto(1L, "John", "john@test.com", "TEACHER"));

        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.user.id").value(1));
    }

    @Test
    void login_invalidCredentials_returnsUnauthorized() throws Exception {
        LoginRequest request = new LoginRequest("john@test.com", "wrong");
        when(authService.login(any())).thenThrow(new UnauthorizedException("Invalid credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }
}
