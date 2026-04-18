package com.examapp.exception;

import com.examapp.dto.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleNotFound_returns404() {
        ResponseEntity<ErrorResponse> response =
                handler.handleNotFound(new ResourceNotFoundException("Not found"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Not found", response.getBody().error());
    }

    @Test
    void handleDuplicate_returns400() {
        ResponseEntity<ErrorResponse> response =
                handler.handleDuplicate(new DuplicateResourceException("Duplicate"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Duplicate", response.getBody().error());
    }

    @Test
    void handleUnauthorized_returns401() {
        ResponseEntity<ErrorResponse> response =
                handler.handleUnauthorized(new UnauthorizedException("Unauthorized"));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Unauthorized", response.getBody().error());
    }

    @Test
    void handleForbidden_returns403() {
        ResponseEntity<ErrorResponse> response =
                handler.handleForbidden(new ForbiddenException("Forbidden"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Forbidden", response.getBody().error());
    }

    @Test
    void handleBadRequest_returns400() {
        ResponseEntity<ErrorResponse> response =
                handler.handleBadRequest(new BadRequestException("Bad request"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Bad request", response.getBody().error());
    }

    @Test
    void handleConflict_returns409() {
        ResponseEntity<ErrorResponse> response =
                handler.handleConflict(new ConflictException("Conflict"));

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Conflict", response.getBody().error());
    }

    @Test
    void handleValidation_returnsFieldErrorMessage() throws Exception {
        BeanPropertyBindingResult bindingResult =
                new BeanPropertyBindingResult(new Object(), "target");
        bindingResult.addError(new FieldError("target", "email", "must be a valid email"));

        MethodParameter param = new MethodParameter(
                Object.class.getMethod("toString"), -1);
        MethodArgumentNotValidException ex =
                new MethodArgumentNotValidException(param, bindingResult);

        ResponseEntity<ErrorResponse> response = handler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("must be a valid email", response.getBody().error());
    }

    @Test
    void handleValidation_noFieldErrors_returnsDefaultMessage() throws Exception {
        BeanPropertyBindingResult bindingResult =
                new BeanPropertyBindingResult(new Object(), "target");

        MethodParameter param = new MethodParameter(
                Object.class.getMethod("toString"), -1);
        MethodArgumentNotValidException ex =
                new MethodArgumentNotValidException(param, bindingResult);

        ResponseEntity<ErrorResponse> response = handler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation failed", response.getBody().error());
    }

    @Test
    void handleTypeMismatch_returns400WithParamName() {
        MethodArgumentTypeMismatchException ex = mock(MethodArgumentTypeMismatchException.class);
        when(ex.getName()).thenReturn("testId");

        ResponseEntity<ErrorResponse> response = handler.handleTypeMismatch(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid value for parameter 'testId'", response.getBody().error());
    }

    @Test
    void handleMissingParam_returns400WithParamName() {
        MissingServletRequestParameterException ex =
                new MissingServletRequestParameterException("format", "String");

        ResponseEntity<ErrorResponse> response = handler.handleMissingParam(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Missing required parameter 'format'", response.getBody().error());
    }

    @Test
    void handleUnreadableBody_returns400() {
        HttpMessageNotReadableException ex = mock(HttpMessageNotReadableException.class);

        ResponseEntity<ErrorResponse> response = handler.handleUnreadableBody(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Malformed or missing request body", response.getBody().error());
    }

    @Test
    void handleUnexpected_returns500WithGenericMessage() {
        ResponseEntity<ErrorResponse> response =
                handler.handleUnexpected(new RuntimeException("boom"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Something went wrong. Please try again later", response.getBody().error());
    }
}
