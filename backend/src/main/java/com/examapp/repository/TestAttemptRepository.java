package com.examapp.repository;

import com.examapp.entity.TestAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    List<TestAttempt> findByStudentIdOrderBySubmittedAtDesc(Long studentId);

    List<TestAttempt> findByExamId(Long examId);

    @Query(value = "SELECT ta FROM TestAttempt ta JOIN ta.student s WHERE ta.exam.id = :examId",
           countQuery = "SELECT count(ta) FROM TestAttempt ta WHERE ta.exam.id = :examId")
    Page<TestAttempt> findByExamIdPaged(@Param("examId") Long examId, Pageable pageable);

    @Query(value = "SELECT ta FROM TestAttempt ta JOIN ta.student s WHERE ta.exam.id = :examId " +
                   "AND LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%'))",
           countQuery = "SELECT count(ta) FROM TestAttempt ta JOIN ta.student s WHERE ta.exam.id = :examId " +
                        "AND LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<TestAttempt> findByExamIdWithSearch(@Param("examId") Long examId,
                                             @Param("search") String search,
                                             Pageable pageable);

    @Query("SELECT COUNT(ta) FROM TestAttempt ta WHERE ta.exam.id = :examId")
    long countByExamId(@Param("examId") Long examId);

    @Query("SELECT AVG(ta.score * 100.0 / ta.maxScore) FROM TestAttempt ta WHERE ta.exam.id = :examId")
    Double averagePercentageByExamId(@Param("examId") Long examId);

    @Query("SELECT MAX(ta.score) FROM TestAttempt ta WHERE ta.exam.id = :examId")
    Integer maxScoreByExamId(@Param("examId") Long examId);

    @Query("SELECT MIN(ta.score) FROM TestAttempt ta WHERE ta.exam.id = :examId")
    Integer minScoreByExamId(@Param("examId") Long examId);
}
