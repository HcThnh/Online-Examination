package com.examapp.dto.test;

import java.time.Instant;

public record TestDetailResponse(
        Long id,
        String title,
        String description,
        String passcode,
        Long teacherId,
        Instant createdAt,
        Instant updatedAt,
        int questionCount,
        long submissionCount,
        Double averageScorePercentage
) {}
