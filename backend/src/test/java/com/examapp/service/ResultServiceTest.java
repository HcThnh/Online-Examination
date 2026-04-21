package com.examapp.service;

import com.examapp.dto.result.*;
import com.examapp.entity.*;
import com.examapp.enums.Role;
import com.examapp.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResultServiceTest {

    @Mock private TestAttemptRepository testAttemptRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private StudentAnswerRepository studentAnswerRepository;
    @Mock private ExamService examService;
    @InjectMocks private ResultService resultService;

    private Exam createExam() {
        User teacher = new User("Teacher", "t@t.com", "hash", Role.TEACHER);
        teacher.setId(1L);
        Exam e = new Exam();
        e.setId(10L);
        e.setTeacher(teacher);
        return e;
    }

    private TestAttempt createAttempt(Exam exam, String studentName, int score, int maxScore) {
        User student = new User(studentName, studentName.toLowerCase() + "@s.com", "N/A", Role.STUDENT);
        student.setId((long) studentName.hashCode());
        TestAttempt ta = new TestAttempt();
        ta.setId((long) studentName.hashCode());
        ta.setExam(exam);
        ta.setStudent(student);
        ta.setScore(score);
        ta.setMaxScore(maxScore);
        ta.setSubmittedAt(Instant.now());
        return ta;
    }

    @Test
    void getClassResults_returnsPaginatedResults() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 10L)).thenReturn(exam);

        TestAttempt ta = createAttempt(exam, "Alice", 80, 100);
        Page<TestAttempt> page = new PageImpl<>(List.of(ta), PageRequest.of(0, 20), 1);
        when(testAttemptRepository.findByExamIdPaged(eq(10L), any(Pageable.class))).thenReturn(page);

        ClassResultsResponse response = resultService.getClassResults(1L, 10L, "score", "desc", null, 0, 20);

        assertEquals(1, response.totalStudents());
        assertEquals(1, response.results().size());
        assertEquals("Alice", response.results().get(0).studentName());
        assertEquals(80, response.results().get(0).score());
    }

    @Test
    void getStatistics_returnsCorrectStats() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 10L)).thenReturn(exam);

        List<TestAttempt> attempts = List.of(
                createAttempt(exam, "Alice", 80, 100),
                createAttempt(exam, "Bob", 60, 100),
                createAttempt(exam, "Charlie", 40, 100)
        );
        when(testAttemptRepository.findByExamId(10L)).thenReturn(attempts);

        ClassStatisticsResponse stats = resultService.getStatistics(1L, 10L);

        assertEquals(3, stats.totalAttempts());
        assertEquals(80, stats.highestScore());
        assertEquals(40, stats.lowestScore());
        assertEquals(10, stats.distribution().size());
    }

    @Test
    void getStatistics_emptyAttempts_returnsZeros() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 10L)).thenReturn(exam);
        when(testAttemptRepository.findByExamId(10L)).thenReturn(List.of());

        ClassStatisticsResponse stats = resultService.getStatistics(1L, 10L);

        assertEquals(0, stats.totalAttempts());
        assertEquals(0.0, stats.averagePercentage());
        assertEquals(10, stats.distribution().size());
    }

    @Test
    void getStatistics_passRateCalculation() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 10L)).thenReturn(exam);

        List<TestAttempt> attempts = List.of(
                createAttempt(exam, "Alice", 80, 100),   // 80% - pass
                createAttempt(exam, "Bob", 60, 100),     // 60% - pass
                createAttempt(exam, "Charlie", 30, 100)  // 30% - fail
        );
        when(testAttemptRepository.findByExamId(10L)).thenReturn(attempts);

        ClassStatisticsResponse stats = resultService.getStatistics(1L, 10L);

        assertEquals(66.7, stats.passRate());
    }

    @Test
    void getQuestionAnalysis_returnsAnalysis() {
        Exam exam = createExam();
        when(examService.getOwnedExam(1L, 10L)).thenReturn(exam);

        Question q = new Question();
        q.setId(1L);
        q.setQuestionText("What is 2+2?");
        q.setPoints(10);
        q.setDisplayOrder(1);

        AnswerOption correct = new AnswerOption();
        correct.setId(1L);
        correct.setOptionText("4");
        correct.setIsCorrect(true);
        correct.setDisplayOrder(1);
        correct.setQuestion(q);

        AnswerOption wrong = new AnswerOption();
        wrong.setId(2L);
        wrong.setOptionText("5");
        wrong.setIsCorrect(false);
        wrong.setDisplayOrder(2);
        wrong.setQuestion(q);

        q.setOptions(new ArrayList<>(List.of(correct, wrong)));

        when(questionRepository.findByExamIdOrderByDisplayOrderAsc(10L)).thenReturn(List.of(q));

        StudentAnswer sa = new StudentAnswer();
        sa.setSelectedOption(correct);
        sa.setQuestion(q);
        when(studentAnswerRepository.findByExamIdAndQuestionId(10L, 1L)).thenReturn(List.of(sa));

        List<QuestionAnalysisResponse> analysis = resultService.getQuestionAnalysis(1L, 10L);

        assertEquals(1, analysis.size());
        assertEquals(100.0, analysis.get(0).correctRate());
        assertEquals(1, analysis.get(0).totalAnswers());
    }
}
