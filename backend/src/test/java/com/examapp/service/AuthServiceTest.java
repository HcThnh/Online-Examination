package com.examapp.service;

import com.examapp.dto.auth.*;
import com.examapp.entity.User;
import com.examapp.enums.Role;
import com.examapp.dto.MessageResponse;
import com.examapp.exception.DuplicateResourceException;
import com.examapp.exception.ResourceNotFoundException;
import com.examapp.exception.UnauthorizedException;
import com.examapp.repository.UserRepository;
import com.examapp.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @InjectMocks private AuthService authService;

    @Test
    void register_success() {
        RegisterRequest request = new RegisterRequest("John", "john@test.com", "password123");
        when(userRepository.existsByEmail("john@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");

        User savedUser = new User("John", "john@test.com", "hashed", Role.TEACHER);
        savedUser.setId(1L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        RegisterResponse response = authService.register(request);

        assertEquals(1L, response.id());
        assertEquals("John", response.name());
        assertEquals("john@test.com", response.email());
        assertEquals("TEACHER", response.role());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateEmail_throwsException() {
        RegisterRequest request = new RegisterRequest("John", "john@test.com", "password123");
        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_success() {
        LoginRequest request = new LoginRequest("john@test.com", "password123");

        User user = new User("John", "john@test.com", "hashed", Role.TEACHER);
        user.setId(1L);
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);
        when(jwtUtil.generateTeacherToken(1L, "john@test.com", "TEACHER")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertEquals("jwt-token", response.token());
        assertEquals(1L, response.user().id());
        assertEquals("John", response.user().name());
    }

    @Test
    void login_invalidEmail_throwsException() {
        LoginRequest request = new LoginRequest("wrong@test.com", "password123");
        when(userRepository.findByEmail("wrong@test.com")).thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    void login_wrongPassword_throwsException() {
        LoginRequest request = new LoginRequest("john@test.com", "wrong");

        User user = new User("John", "john@test.com", "hashed", Role.TEACHER);
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    void changePassword_success() {
        ChangePasswordRequest request = new ChangePasswordRequest("password123", "newpassword1");
        User user = new User("John", "john@test.com", "old-hash", Role.TEACHER);
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "old-hash")).thenReturn(true);
        when(passwordEncoder.encode("newpassword1")).thenReturn("new-hash");

        MessageResponse response = authService.changePassword(1L, request);

        assertEquals("Password updated successfully", response.message());
        verify(userRepository).save(argThat(u -> "new-hash".equals(u.getPasswordHash())));
    }

    @Test
    void changePassword_wrongCurrentPassword_throwsException() {
        ChangePasswordRequest request = new ChangePasswordRequest("wrong", "newpassword1");
        User user = new User("John", "john@test.com", "old-hash", Role.TEACHER);
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "old-hash")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.changePassword(1L, request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_userNotFound_throwsException() {
        ChangePasswordRequest request = new ChangePasswordRequest("password123", "newpassword1");
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.changePassword(99L, request));
    }
}
