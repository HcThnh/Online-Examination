package com.examapp.service;

import com.examapp.entity.TestAttempt;
import com.examapp.repository.TestAttemptRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    private final TestAttemptRepository testAttemptRepository;
    private final ExamService examService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneOffset.UTC);

    public ExportService(TestAttemptRepository testAttemptRepository, ExamService examService) {
        this.testAttemptRepository = testAttemptRepository;
        this.examService = examService;
    }

    public void exportCsv(Long teacherId, Long testId, HttpServletResponse response) throws IOException {
        var exam = examService.getOwnedExam(teacherId, testId);
        List<TestAttempt> attempts = testAttemptRepository.findByExamId(testId);

        String filename = exam.getTitle().replaceAll("[^a-zA-Z0-9]", "_") + "_results.csv";
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        PrintWriter writer = response.getWriter();
        writer.println("Student Name,Score,Max Score,Percentage,Submitted Date");

        for (TestAttempt ta : attempts) {
            double pct = ta.getMaxScore() > 0 ? Math.round(ta.getScore() * 1000.0 / ta.getMaxScore()) / 10.0 : 0;
            writer.printf("\"%s\",%d,%d,%.1f,%s%n",
                    escapeCsv(ta.getStudent().getName()),
                    ta.getScore(),
                    ta.getMaxScore(),
                    pct,
                    DATE_FMT.format(ta.getSubmittedAt()));
        }
        writer.flush();
    }

    public void exportExcel(Long teacherId, Long testId, HttpServletResponse response) throws IOException {
        var exam = examService.getOwnedExam(teacherId, testId);
        List<TestAttempt> attempts = testAttemptRepository.findByExamId(testId);

        String filename = exam.getTitle().replaceAll("[^a-zA-Z0-9]", "_") + "_results.xlsx";
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Results");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row header = sheet.createRow(0);
            String[] columns = {"Student Name", "Score", "Max Score", "Percentage", "Submitted Date"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (TestAttempt ta : attempts) {
                Row row = sheet.createRow(rowIdx++);
                double pct = ta.getMaxScore() > 0 ? Math.round(ta.getScore() * 1000.0 / ta.getMaxScore()) / 10.0 : 0;
                row.createCell(0).setCellValue(ta.getStudent().getName());
                row.createCell(1).setCellValue(ta.getScore());
                row.createCell(2).setCellValue(ta.getMaxScore());
                row.createCell(3).setCellValue(pct);
                row.createCell(4).setCellValue(DATE_FMT.format(ta.getSubmittedAt()));
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(response.getOutputStream());
        }
    }

    private String escapeCsv(String value) {
        return value.replace("\"", "\"\"");
    }
}
