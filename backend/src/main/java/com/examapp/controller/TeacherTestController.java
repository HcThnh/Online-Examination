package com.examapp.controller;

import com.examapp.dto.test.CreateTestRequest;
import com.examapp.dto.test.TestResponse;
import com.examapp.dto.test.TestSummaryResponse;
import com.examapp.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/tests")
@Tag(name = "Teacher - Tests", description = "Create, update, delete, and list tests")
public class TeacherTestController {

    private final ExamService examService;

    public TeacherTestController(ExamService examService) {
        this.examService = examService;
    }

    @PostMapping
    @Operation(summary = "Create a new test", description = "Creates a test with title, description, and passcode")
    public ResponseEntity<TestResponse> createTest(Authentication auth,
                                                    @Valid @RequestBody CreateTestRequest request) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.createTest(teacherId, request));
    }

    @GetMapping
    @Operation(summary = "List teacher's tests", description = "Returns all tests created by the authenticated teacher")
    public ResponseEntity<List<TestSummaryResponse>> listTests(Authentication auth) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(examService.listTests(teacherId));
    }

    @PutMapping("/{testId}")
    @Operation(summary = "Update a test", description = "Updates title, description, and passcode of an existing test")
    public ResponseEntity<TestResponse> updateTest(Authentication auth,
                                                    @PathVariable Long testId,
                                                    @Valid @RequestBody CreateTestRequest request) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(examService.updateTest(teacherId, testId, request));
    }

    @DeleteMapping("/{testId}")
    @Operation(summary = "Delete a test", description = "Deletes a test and all related questions, options, and results")
    public ResponseEntity<Void> deleteTest(Authentication auth, @PathVariable Long testId) {
        Long teacherId = (Long) auth.getPrincipal();
        examService.deleteTest(teacherId, testId);
        return ResponseEntity.noContent().build();
    }
}
