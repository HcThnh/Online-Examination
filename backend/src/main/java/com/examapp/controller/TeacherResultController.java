package com.examapp.controller;

import com.examapp.dto.result.ClassResultsResponse;
import com.examapp.dto.result.ClassStatisticsResponse;
import com.examapp.dto.result.QuestionAnalysisResponse;
import com.examapp.service.ExportService;
import com.examapp.service.ResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/teacher/tests/{testId}")
@Tag(name = "Teacher - Results & Analytics", description = "View class results, statistics, question analysis, and export data")
public class TeacherResultController {

    private final ResultService resultService;
    private final ExportService exportService;

    public TeacherResultController(ResultService resultService, ExportService exportService) {
        this.resultService = resultService;
        this.exportService = exportService;
    }

    @GetMapping("/results")
    @Operation(summary = "Get class results", description = "Returns paginated student results with search and sort")
    public ResponseEntity<ClassResultsResponse> getClassResults(
            Authentication auth,
            @PathVariable Long testId,
            @RequestParam(defaultValue = "submittedAt") String sort,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(resultService.getClassResults(teacherId, testId, sort, order, search, page, size));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get class statistics", description = "Returns aggregate stats: average, highest, lowest, pass rate, and score distribution")
    public ResponseEntity<ClassStatisticsResponse> getStatistics(Authentication auth,
                                                                   @PathVariable Long testId) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(resultService.getStatistics(teacherId, testId));
    }

    @GetMapping("/question-analysis")
    @Operation(summary = "Get per-question analysis", description = "Returns correct rate and answer distribution for each question")
    public ResponseEntity<List<QuestionAnalysisResponse>> getQuestionAnalysis(Authentication auth,
                                                                                @PathVariable Long testId) {
        Long teacherId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(resultService.getQuestionAnalysis(teacherId, testId));
    }

    @GetMapping("/results/export")
    @Operation(summary = "Export results", description = "Download results as CSV or Excel file")
    public void exportResults(Authentication auth,
                              @PathVariable Long testId,
                              @RequestParam(defaultValue = "csv") String format,
                              HttpServletResponse response) throws IOException {
        Long teacherId = (Long) auth.getPrincipal();
        if ("xlsx".equalsIgnoreCase(format)) {
            exportService.exportExcel(teacherId, testId, response);
        } else {
            exportService.exportCsv(teacherId, testId, response);
        }
    }
}
