package com.examapp.service;

import com.examapp.dto.student.AttemptResultResponse;
import com.examapp.dto.student.PastAttemptResponse;
import com.examapp.dto.student.StudentAccessRequest;
import com.examapp.dto.student.StudentAccessResponse;
import com.examapp.dto.student.StudentTestResponse;
import com.examapp.dto.student.SubmitResultResponse;
import com.examapp.dto.student.SubmitTestRequest;
import com.examapp.entity.AnswerOption;
import com.examapp.entity.Exam;
import com.examapp.entity.Question;
import com.examapp.entity.StudentAnswer;
import com.examapp.entity.TestAttempt;
import com.examapp.entity.User;
import com.examapp.enums.Role;
import com.examapp.exception.ConflictException;
import com.examapp.exception.ResourceNotFoundException;
import com.examapp.repository.AnswerOptionRepository;
import com.examapp.repository.ExamRepository;
import com.examapp.repository.QuestionRepository;
import com.examapp.repository.StudentAnswerRepository;
import com.examapp.repository.TestAttemptRepository;
import com.examapp.repository.UserRepository;
import com.examapp.security.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final ExamRepository examRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final AnswerOptionRepository answerOptionRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final JwtUtil jwtUtil;

    public StudentService(ExamRepository examRepository,
                          UserRepository userRepository,
                          QuestionRepository questionRepository,
                          AnswerOptionRepository answerOptionRepository,
                          TestAttemptRepository testAttemptRepository,
                          StudentAnswerRepository studentAnswerRepository,
                          JwtUtil jwtUtil) {
        this.examRepository = examRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
        this.answerOptionRepository = answerOptionRepository;
        this.testAttemptRepository = testAttemptRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public StudentAccessResponse accessTest(StudentAccessRequest request) {
        Exam exam = examRepository.findByPasscode(request.passcode())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid passcode"));

        String email = request.studentName().toLowerCase().replaceAll("\\s+", ".") + "@student.exam";
        User student = userRepository.findByEmail(email).orElseGet(() -> {
            User newStudent = new User(request.studentName(), email, "N/A", Role.STUDENT);
            return userRepository.save(newStudent);
        });

        String token = jwtUtil.generateStudentToken(student.getId(), exam.getId(), Role.STUDENT.name());

        return new StudentAccessResponse(token, exam.getId(), exam.getTitle(), student.getId());
    }

    public StudentTestResponse getTestQuestions(Long testId) {
        Exam exam = examRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found"));

        List<Question> questions = questionRepository.findByExamIdOrderByDisplayOrderAsc(testId);

        List<StudentTestResponse.StudentQuestionDto> questionDtos = questions.stream()
                .map(q -> new StudentTestResponse.StudentQuestionDto(
                        q.getId(),
                        q.getQuestionText(),
                        q.getPoints(),
                        q.getDisplayOrder(),
                        q.getOptions().stream()
                                .map(o -> new StudentTestResponse.StudentOptionDto(o.getId(), o.getOptionText(), o.getDisplayOrder()))
                                .toList()
                ))
                .toList();

        return new StudentTestResponse(exam.getTitle(), exam.getDescription(), questions.size(), questionDtos);
    }

    @Transactional
    public SubmitResultResponse submitTest(Long studentId, Long testId, SubmitTestRequest request) {
        if (testAttemptRepository.existsByExamIdAndStudentId(testId, studentId)) {
            throw new ConflictException("Test already submitted");
        }

        Exam exam = examRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Question> questions = questionRepository.findByExamIdOrderByDisplayOrderAsc(testId);
        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        int score = 0;
        int maxScore = questions.stream().mapToInt(Question::getPoints).sum();

        TestAttempt attempt = new TestAttempt();
        attempt.setExam(exam);
        attempt.setStudent(student);

        List<StudentAnswer> answers = new ArrayList<>();
        for (SubmitTestRequest.AnswerDto answerDto : request.answers()) {
            Question question = questionMap.get(answerDto.questionId());
            if (question == null) {
                continue;
            }

            AnswerOption selectedOption = answerOptionRepository.findById(answerDto.selectedOptionId())
                    .orElse(null);
            if (selectedOption == null) {
                continue;
            }

            StudentAnswer studentAnswer = new StudentAnswer();
            studentAnswer.setAttempt(attempt);
            studentAnswer.setQuestion(question);
            studentAnswer.setSelectedOption(selectedOption);
            answers.add(studentAnswer);

            if (selectedOption.getIsCorrect()) {
                score += question.getPoints();
            }
        }

        attempt.setScore(score);
        attempt.setMaxScore(maxScore);
        attempt.setAnswers(answers);
        attempt = testAttemptRepository.save(attempt);

        double percentage = maxScore > 0 ? Math.round(score * 1000.0 / maxScore) / 10.0 : 0;

        return new SubmitResultResponse(attempt.getId(), score, maxScore, percentage, attempt.getSubmittedAt());
    }

    public AttemptResultResponse getAttemptResult(Long studentId, Long attemptId) {
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if (!attempt.getStudent().getId().equals(studentId)) {
            throw new ResourceNotFoundException("Attempt not found");
        }

        List<StudentAnswer> answers = studentAnswerRepository.findByAttemptId(attemptId);

        List<AttemptResultResponse.QuestionResultDto> questionResults = answers.stream()
                .map(sa -> {
                    Question q = sa.getQuestion();
                    AnswerOption selected = sa.getSelectedOption();
                    AnswerOption correct = q.getOptions().stream()
                            .filter(AnswerOption::getIsCorrect)
                            .findFirst()
                            .orElse(null);

                    return new AttemptResultResponse.QuestionResultDto(
                            q.getId(),
                            q.getQuestionText(),
                            q.getPoints(),
                            selected.getId(),
                            selected.getOptionText(),
                            correct != null ? correct.getId() : null,
                            correct != null ? correct.getOptionText() : null,
                            selected.getIsCorrect()
                    );
                })
                .toList();

        double percentage = attempt.getMaxScore() > 0
                ? Math.round(attempt.getScore() * 1000.0 / attempt.getMaxScore()) / 10.0 : 0;

        return new AttemptResultResponse(
                attempt.getId(),
                attempt.getExam().getTitle(),
                attempt.getScore(),
                attempt.getMaxScore(),
                percentage,
                attempt.getSubmittedAt(),
                questionResults
        );
    }

    public List<PastAttemptResponse> getPastAttempts(Long studentId) {
        return testAttemptRepository.findByStudentIdOrderBySubmittedAtDesc(studentId).stream()
                .map(ta -> {
                    double pct = ta.getMaxScore() > 0
                            ? Math.round(ta.getScore() * 1000.0 / ta.getMaxScore()) / 10.0 : 0;
                    return new PastAttemptResponse(
                            ta.getId(),
                            ta.getExam().getTitle(),
                            ta.getScore(),
                            ta.getMaxScore(),
                            pct,
                            ta.getSubmittedAt()
                    );
                })
                .toList();
    }
}
