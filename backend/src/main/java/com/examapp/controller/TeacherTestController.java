package com.examapp.controller;

import com.examapp.dto.test.*;
import com.examapp.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{testId}")
    @Operation(summary = "Get test details", description = "Returns test metadata, question count, and submission statistics")
    public ResponseEntity<TestDetailResponse> getTestDetail(Authentication auth, @PathVariable Long testId) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(examService.getTestDetail(teacherId, testId));
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
