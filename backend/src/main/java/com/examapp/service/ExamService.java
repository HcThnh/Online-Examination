package com.examapp.service;

import com.examapp.dto.test.CreateTestRequest;
import com.examapp.dto.test.TestResponse;
import com.examapp.dto.test.TestSummaryResponse;
import com.examapp.entity.Exam;
import com.examapp.entity.User;
import com.examapp.exception.DuplicateResourceException;
import com.examapp.exception.ResourceNotFoundException;
import com.examapp.exception.ForbiddenException;
import com.examapp.repository.ExamRepository;
import com.examapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final UserRepository userRepository;

    public ExamService(ExamRepository examRepository, UserRepository userRepository) {
        this.examRepository = examRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TestResponse createTest(Long teacherId, CreateTestRequest request) {
        if (examRepository.existsByPasscode(request.passcode())) {
            throw new DuplicateResourceException("Passcode already in use");
        }

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        Exam exam = new Exam();
        exam.setTitle(request.title());
        exam.setDescription(request.description());
        exam.setPasscode(request.passcode());
        exam.setTeacher(teacher);

        exam = examRepository.save(exam);

        return toTestResponse(exam);
    }

    public List<TestSummaryResponse> listTests(Long teacherId) {
        return examRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId).stream()
                .map(exam -> new TestSummaryResponse(
                        exam.getId(),
                        exam.getTitle(),
                        exam.getPasscode(),
                        examRepository.countQuestionsByExamId(exam.getId()),
                        exam.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public TestResponse updateTest(Long teacherId, Long testId, CreateTestRequest request) {
        Exam exam = getOwnedExam(teacherId, testId);

        if (!exam.getPasscode().equals(request.passcode()) && examRepository.existsByPasscode(request.passcode())) {
            throw new DuplicateResourceException("Passcode already in use");
        }

        exam.setTitle(request.title());
        exam.setDescription(request.description());
        exam.setPasscode(request.passcode());

        exam = examRepository.save(exam);
        return toTestResponse(exam);
    }

    @Transactional
    public void deleteTest(Long teacherId, Long testId) {
        Exam exam = getOwnedExam(teacherId, testId);
        examRepository.delete(exam);
    }

    public Exam getOwnedExam(Long teacherId, Long testId) {
        Exam exam = examRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found"));

        if (!exam.getTeacher().getId().equals(teacherId)) {
            throw new ForbiddenException("Not authorized to access this test");
        }

        return exam;
    }

    private TestResponse toTestResponse(Exam exam) {
        return new TestResponse(
                exam.getId(),
                exam.getTitle(),
                exam.getDescription(),
                exam.getPasscode(),
                exam.getTeacher().getId(),
                exam.getCreatedAt(),
                exam.getUpdatedAt()
        );
    }
}
