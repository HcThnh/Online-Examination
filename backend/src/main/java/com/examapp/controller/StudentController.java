package com.examapp.controller;

import com.examapp.dto.student.AttemptResultResponse;
import com.examapp.dto.student.PastAttemptResponse;
import com.examapp.dto.student.StudentAccessRequest;
import com.examapp.dto.student.StudentAccessResponse;
import com.examapp.dto.student.StudentTestResponse;
import com.examapp.dto.student.SubmitResultResponse;
import com.examapp.dto.student.SubmitTestRequest;
import com.examapp.security.JwtUtil;
import com.examapp.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@Tag(name = "Student", description = "Access tests, take exams, submit answers, and view results")
public class StudentController {

    private final StudentService studentService;
    private final JwtUtil jwtUtil;

    public StudentController(StudentService studentService, JwtUtil jwtUtil) {
        this.studentService = studentService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/access")
    @Operation(summary = "Access a test via passcode", description = "Enter a passcode and student name to get a JWT token scoped to the test")
    public ResponseEntity<StudentAccessResponse> accessTest(@Valid @RequestBody StudentAccessRequest request) {
        return ResponseEntity.ok(studentService.accessTest(request));
    }

    @GetMapping("/tests/{testId}/questions")
    @Operation(summary = "Get test questions for student", description = "Returns questions without correct answer flags")
    public ResponseEntity<StudentTestResponse> getTestQuestions(Authentication auth,
                                                                 @PathVariable Long testId) {
        verifyTestAccess(auth, testId);
        return ResponseEntity.ok(studentService.getTestQuestions(testId));
    }

    @PostMapping("/tests/{testId}/submit")
    @Operation(summary = "Submit test answers", description = "Submits answers and returns auto-graded score")
    public ResponseEntity<SubmitResultResponse> submitTest(Authentication auth,
                                                            @PathVariable Long testId,
                                                            @Valid @RequestBody SubmitTestRequest request) {
        verifyTestAccess(auth, testId);
        Long studentId = (Long) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.submitTest(studentId, testId, request));
    }

    @GetMapping("/attempts/{attemptId}")
    @Operation(summary = "Get attempt result", description = "Returns detailed score breakdown with correct answers")
    public ResponseEntity<AttemptResultResponse> getAttemptResult(Authentication auth,
                                                                    @PathVariable Long attemptId) {
        Long studentId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(studentService.getAttemptResult(studentId, attemptId));
    }

    @GetMapping("/my-results")
    @Operation(summary = "Get past results", description = "Returns all past test attempts for the authenticated student")
    public ResponseEntity<List<PastAttemptResponse>> getPastResults(Authentication auth) {
        Long studentId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(studentService.getPastAttempts(studentId));
    }

    private void verifyTestAccess(Authentication auth, Long testId) {
        String token = (String) auth.getCredentials();
        Long tokenTestId = jwtUtil.getTestId(token);
        if (!testId.equals(tokenTestId)) {
            throw new com.examapp.exception.ForbiddenException("Not authorized to access this test");
        }
    }
}
