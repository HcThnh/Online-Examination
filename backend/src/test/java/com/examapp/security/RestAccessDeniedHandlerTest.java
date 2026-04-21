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
import org.springframework.http.MediaType;
import org.springframework.mock.web.DelegatingServletOutputStream;
import org.springframework.security.access.AccessDeniedException;

import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RestAccessDeniedHandlerTest {

    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;

    @Test
    void handle_returns403WithPermissionMessage() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        ByteArrayOutputStream body = new ByteArrayOutputStream();
        when(response.getOutputStream()).thenReturn(new DelegatingServletOutputStream(body));

        new RestAccessDeniedHandler(objectMapper)
                .handle(request, response, new AccessDeniedException("x"));

        verify(response).setStatus(HttpServletResponse.SC_FORBIDDEN);
        verify(response).setContentType(MediaType.APPLICATION_JSON_VALUE);
        JsonNode json = objectMapper.readTree(body.toByteArray());
        assertEquals("You do not have permission to access this resource", json.get("error").asText());
    }
}
