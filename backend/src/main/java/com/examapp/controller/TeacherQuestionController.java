package com.examapp.controller;

import com.examapp.dto.MessageResponse;
import com.examapp.dto.question.QuestionRequest;
import com.examapp.dto.question.QuestionResponse;
import com.examapp.dto.question.ReorderRequest;
import com.examapp.service.QuestionService;
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
@RequestMapping("/api/teacher/tests/{testId}/questions")
@Tag(name = "Teacher - Questions", description = "Add, update, delete, and reorder questions within a test")
public class TeacherQuestionController {

    private final QuestionService questionService;

    public TeacherQuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    @Operation(summary = "Add a question", description = "Adds a new multiple-choice question with answer options to a test")
    public ResponseEntity<QuestionResponse> addQuestion(Authentication auth,
                                                         @PathVariable Long testId,
                                                         @Valid @RequestBody QuestionRequest request) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(questionService.addQuestion(teacherId, testId, request));
    }

    @GetMapping
    @Operation(summary = "Get all questions", description = "Returns all questions for a test, ordered by display order")
    public ResponseEntity<List<QuestionResponse>> getQuestions(Authentication auth,
                                                                @PathVariable Long testId) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(questionService.getQuestions(teacherId, testId));
    }

    @PutMapping("/{questionId}")
    @Operation(summary = "Update a question", description = "Replaces question text, points, and all answer options")
    public ResponseEntity<QuestionResponse> updateQuestion(Authentication auth,
                                                            @PathVariable Long testId,
                                                            @PathVariable Long questionId,
                                                            @Valid @RequestBody QuestionRequest request) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(questionService.updateQuestion(teacherId, testId, questionId, request));
    }

    @DeleteMapping("/{questionId}")
    @Operation(summary = "Delete a question", description = "Deletes a question and its answer options")
    public ResponseEntity<Void> deleteQuestion(Authentication auth,
                                                @PathVariable Long testId,
                                                @PathVariable Long questionId) {
        Long teacherId = (Long) auth.getPrincipal();
        questionService.deleteQuestion(teacherId, testId, questionId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    @Operation(summary = "Reorder questions", description = "Updates display order based on the provided question ID sequence")
    public ResponseEntity<MessageResponse> reorderQuestions(Authentication auth,
                                                             @PathVariable Long testId,
                                                             @Valid @RequestBody ReorderRequest request) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(questionService.reorderQuestions(teacherId, testId, request.questionIds()));
    }
}
