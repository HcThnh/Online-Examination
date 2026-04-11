package com.examapp.service;

import com.examapp.dto.question.QuestionRequest;
import com.examapp.dto.question.QuestionResponse;
import com.examapp.dto.MessageResponse;
import com.examapp.entity.AnswerOption;
import com.examapp.entity.Exam;
import com.examapp.entity.Question;
import com.examapp.exception.BadRequestException;
import com.examapp.exception.ResourceNotFoundException;
import com.examapp.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamService examService;

    public QuestionService(QuestionRepository questionRepository, ExamService examService) {
        this.questionRepository = questionRepository;
        this.examService = examService;
    }

    @Transactional
    public QuestionResponse addQuestion(Long teacherId, Long testId, QuestionRequest request) {
        Exam exam = examService.getOwnedExam(teacherId, testId);
        validateOptions(request.options());

        Question question = new Question();
        question.setExam(exam);
        question.setQuestionText(request.questionText());
        question.setPoints(request.points());
        question.setDisplayOrder(request.displayOrder());

        List<AnswerOption> options = new ArrayList<>();
        for (QuestionRequest.OptionRequest optReq : request.options()) {
            AnswerOption option = new AnswerOption();
            option.setQuestion(question);
            option.setOptionText(optReq.optionText());
            option.setIsCorrect(optReq.isCorrect());
            option.setDisplayOrder(optReq.displayOrder());
            options.add(option);
        }
        question.setOptions(options);

        question = questionRepository.save(question);
        return toQuestionResponse(question);
    }

    public List<QuestionResponse> getQuestions(Long teacherId, Long testId) {
        examService.getOwnedExam(teacherId, testId);
        return questionRepository.findByExamIdOrderByDisplayOrderAsc(testId).stream()
                .map(this::toQuestionResponse)
                .toList();
    }

    @Transactional
    public QuestionResponse updateQuestion(Long teacherId, Long testId, Long questionId, QuestionRequest request) {
        examService.getOwnedExam(teacherId, testId);
        validateOptions(request.options());

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        question.setQuestionText(request.questionText());
        question.setPoints(request.points());
        question.setDisplayOrder(request.displayOrder());

        question.getOptions().clear();
        for (QuestionRequest.OptionRequest optReq : request.options()) {
            AnswerOption option = new AnswerOption();
            option.setQuestion(question);
            option.setOptionText(optReq.optionText());
            option.setIsCorrect(optReq.isCorrect());
            option.setDisplayOrder(optReq.displayOrder());
            question.getOptions().add(option);
        }

        question = questionRepository.save(question);
        return toQuestionResponse(question);
    }

    @Transactional
    public void deleteQuestion(Long teacherId, Long testId, Long questionId) {
        examService.getOwnedExam(teacherId, testId);
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        questionRepository.delete(question);
    }

    @Transactional
    public MessageResponse reorderQuestions(Long teacherId, Long testId, List<Long> questionIds) {
        examService.getOwnedExam(teacherId, testId);
        for (int i = 0; i < questionIds.size(); i++) {
            Question question = questionRepository.findById(questionIds.get(i))
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
            question.setDisplayOrder(i + 1);
            questionRepository.save(question);
        }
        return new MessageResponse("Questions reordered");
    }

    private void validateOptions(List<QuestionRequest.OptionRequest> options) {
        long correctCount = options.stream().filter(QuestionRequest.OptionRequest::isCorrect).count();
        if (correctCount != 1) {
            throw new BadRequestException("Exactly one correct answer required");
        }
    }

    private QuestionResponse toQuestionResponse(Question question) {
        List<QuestionResponse.OptionResponse> optionResponses = question.getOptions().stream()
                .map(o -> new QuestionResponse.OptionResponse(o.getId(), o.getOptionText(), o.getIsCorrect(), o.getDisplayOrder()))
                .toList();
        return new QuestionResponse(
                question.getId(),
                question.getQuestionText(),
                question.getPoints(),
                question.getDisplayOrder(),
                optionResponses
        );
    }
}
