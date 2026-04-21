package com.examapp.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.DelegatingServletOutputStream;
import org.springframework.security.authentication.BadCredentialsException;

import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RestAuthenticationEntryPointTest {

    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;

    private RestAuthenticationEntryPoint entryPoint;
    private ObjectMapper objectMapper;
    private ByteArrayOutputStream body;

    @BeforeEach
    void setUp() throws Exception {
        objectMapper = new ObjectMapper();
        entryPoint = new RestAuthenticationEntryPoint(objectMapper);
        body = new ByteArrayOutputStream();
        when(response.getOutputStream()).thenReturn(new DelegatingServletOutputStream(body));
    }

    @Test
    void commence_noAuthHeader_returns401WithAuthRequiredMessage() throws Exception {
        when(request.getAttribute(RestAuthenticationEntryPoint.INVALID_TOKEN_ATTRIBUTE)).thenReturn(null);

        entryPoint.commence(request, response, new BadCredentialsException("x"));

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).setContentType(MediaType.APPLICATION_JSON_VALUE);
        verify(response).setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
        JsonNode json = objectMapper.readTree(body.toByteArray());
        assertEquals("Authentication required. Please provide a valid JWT token", json.get("error").asText());
    }

    @Test
    void commence_invalidToken_returns401WithInvalidTokenMessage() throws Exception {
        when(request.getAttribute(RestAuthenticationEntryPoint.INVALID_TOKEN_ATTRIBUTE)).thenReturn(Boolean.TRUE);

        entryPoint.commence(request, response, new BadCredentialsException("x"));

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        JsonNode json = objectMapper.readTree(body.toByteArray());
        assertEquals("Invalid or expired authentication token", json.get("error").asText());
    }
}
