package com.examapp.service;

import com.examapp.dto.MessageResponse;
import com.examapp.dto.auth.AuthResponse;
import com.examapp.dto.auth.ChangePasswordRequest;
import com.examapp.dto.auth.LoginRequest;
import com.examapp.dto.auth.RegisterRequest;
import com.examapp.dto.auth.RegisterResponse;
import com.examapp.entity.User;
import com.examapp.enums.Role;
import com.examapp.exception.DuplicateResourceException;
import com.examapp.exception.ResourceNotFoundException;
import com.examapp.exception.UnauthorizedException;
import com.examapp.repository.UserRepository;
import com.examapp.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already exists");
        }

        User user = new User(
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                Role.TEACHER
        );
        user = userRepository.save(user);

        return new RegisterResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtUtil.generateTeacherToken(user.getId(), user.getEmail(), user.getRole().name());

        return new AuthResponse(token,
                new AuthResponse.UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole().name()));
    }

    public MessageResponse changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return new MessageResponse("Password updated successfully");
    }
}
