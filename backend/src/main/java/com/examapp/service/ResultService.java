package com.examapp.service;

import com.examapp.dto.result.*;
import com.examapp.entity.*;
import com.examapp.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResultService {

    private final TestAttemptRepository testAttemptRepository;
    private final QuestionRepository questionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final ExamService examService;

    private static final int PASS_THRESHOLD = 50;

    public ResultService(TestAttemptRepository testAttemptRepository,
                         QuestionRepository questionRepository,
                         StudentAnswerRepository studentAnswerRepository,
                         ExamService examService) {
        this.testAttemptRepository = testAttemptRepository;
        this.questionRepository = questionRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.examService = examService;
    }

    public ClassResultsResponse getClassResults(Long teacherId, Long testId,
                                                 String sort, String order,
                                                 String search, int page, int size) {
        examService.getOwnedExam(teacherId, testId);

        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortField = mapSortField(sort);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Page<TestAttempt> attemptPage = (search == null || search.isBlank())
                ? testAttemptRepository.findByExamIdPaged(testId, pageable)
                : testAttemptRepository.findByExamIdWithSearch(testId, search, pageable);

        List<ClassResultsResponse.StudentResultDto> results = attemptPage.getContent().stream()
                .map(ta -> {
                    double pct = ta.getMaxScore() > 0
                            ? Math.round(ta.getScore() * 1000.0 / ta.getMaxScore()) / 10.0 : 0;
                    return new ClassResultsResponse.StudentResultDto(
                            ta.getId(),
                            ta.getStudent().getName(),
                            ta.getScore(),
                            ta.getMaxScore(),
                            pct,
                            ta.getSubmittedAt()
                    );
                })
                .toList();

        return new ClassResultsResponse(attemptPage.getTotalElements(), page, size, results);
    }

    public ClassStatisticsResponse getStatistics(Long teacherId, Long testId) {
        examService.getOwnedExam(teacherId, testId);

        List<TestAttempt> attempts = testAttemptRepository.findByExamId(testId);
        long total = attempts.size();

        if (total == 0) {
            return new ClassStatisticsResponse(0, 0.0, 0, 0, 0.0, 0.0, PASS_THRESHOLD, emptyDistribution());
        }

        List<Double> percentages = attempts.stream()
                .map(ta -> ta.getMaxScore() > 0 ? ta.getScore() * 100.0 / ta.getMaxScore() : 0.0)
                .toList();

        double avgPercentage = Math.round(percentages.stream().mapToDouble(Double::doubleValue).average().orElse(0) * 10) / 10.0;
        int highest = attempts.stream().mapToInt(TestAttempt::getScore).max().orElse(0);
        int lowest = attempts.stream().mapToInt(TestAttempt::getScore).min().orElse(0);
        double avgScore = Math.round(attempts.stream().mapToInt(TestAttempt::getScore).average().orElse(0) * 10) / 10.0;
        long passing = percentages.stream().filter(p -> p >= PASS_THRESHOLD).count();
        double passRate = Math.round(passing * 1000.0 / total) / 10.0;

        List<ClassStatisticsResponse.DistributionBucket> distribution = buildDistribution(percentages);

        return new ClassStatisticsResponse(total, avgScore, highest, lowest, avgPercentage, passRate, PASS_THRESHOLD, distribution);
    }

    public List<QuestionAnalysisResponse> getQuestionAnalysis(Long teacherId, Long testId) {
        examService.getOwnedExam(teacherId, testId);

        List<Question> questions = questionRepository.findByExamIdOrderByDisplayOrderAsc(testId);

        return questions.stream().map(q -> {
            List<StudentAnswer> answers = studentAnswerRepository.findByExamIdAndQuestionId(testId, q.getId());
            long totalAnswers = answers.size();

            Map<Long, Long> optionCounts = answers.stream()
                    .collect(Collectors.groupingBy(sa -> sa.getSelectedOption().getId(), Collectors.counting()));

            List<QuestionAnalysisResponse.OptionDistribution> optDist = q.getOptions().stream()
                    .map(o -> {
                        long count = optionCounts.getOrDefault(o.getId(), 0L);
                        double pct = totalAnswers > 0 ? Math.round(count * 1000.0 / totalAnswers) / 10.0 : 0;
                        return new QuestionAnalysisResponse.OptionDistribution(
                                o.getId(), o.getOptionText(), o.getIsCorrect(), count, pct);
                    })
                    .toList();

            long correctCount = answers.stream()
                    .filter(sa -> sa.getSelectedOption().getIsCorrect())
                    .count();
            double correctRate = totalAnswers > 0 ? Math.round(correctCount * 1000.0 / totalAnswers) / 10.0 : 0;

            return new QuestionAnalysisResponse(q.getId(), q.getQuestionText(), q.getPoints(), correctRate, totalAnswers, optDist);
        }).toList();
    }

    private String mapSortField(String sort) {
        if (sort == null) return "submittedAt";
        return switch (sort) {
            case "studentName" -> "student.name";
            case "score" -> "score";
            case "percentage" -> "score";
            case "submittedAt" -> "submittedAt";
            default -> "submittedAt";
        };
    }

    private List<ClassStatisticsResponse.DistributionBucket> buildDistribution(List<Double> percentages) {
        String[] ranges = {"0-10%", "10-20%", "20-30%", "30-40%", "40-50%", "50-60%", "60-70%", "70-80%", "80-90%", "90-100%"};
        long[] counts = new long[10];

        for (double p : percentages) {
            int bucket = Math.min((int) (p / 10), 9);
            counts[bucket]++;
        }

        List<ClassStatisticsResponse.DistributionBucket> dist = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            dist.add(new ClassStatisticsResponse.DistributionBucket(ranges[i], counts[i]));
        }
        return dist;
    }

    private List<ClassStatisticsResponse.DistributionBucket> emptyDistribution() {
        String[] ranges = {"0-10%", "10-20%", "20-30%", "30-40%", "40-50%", "50-60%", "60-70%", "70-80%", "80-90%", "90-100%"};
        List<ClassStatisticsResponse.DistributionBucket> dist = new ArrayList<>();
        for (String range : ranges) {
            dist.add(new ClassStatisticsResponse.DistributionBucket(range, 0));
        }
        return dist;
    }
}
