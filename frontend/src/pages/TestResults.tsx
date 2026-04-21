// src/pages/TestResultPage.tsx
import React from 'react';

// Định nghĩa kiểu dữ liệu cho một câu hỏi đã chấm
interface GradedQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number; // Đáp án đúng
  studentOptionIndex: number; // Đáp án học sinh đã chọn
  points: number;
}

// Mock data kết quả trả về từ Backend sau khi chấm
const MOCK_RESULT = {
  testTitle: "Kiểm tra 15p Toán",
  studentName: "Nguyễn Văn A",
  score: 8.0,
  totalPoints: 10.0,
  gradedQuestions: [
    {
      id: 1,
      questionText: "1 + 1 bằng mấy?",
      options: ["1", "2", "3", "4"],
      correctOptionIndex: 1, // B đúng
      studentOptionIndex: 1, // Học sinh chọn B -> Đúng
      points: 5
    },
    {
      id: 2,
      questionText: "Căn bậc hai của 16 là?",
      options: ["2", "4", "6", "8"],
      correctOptionIndex: 1, // B đúng
      studentOptionIndex: 3, // Học sinh chọn D -> Sai
      points: 5
    }
  ] as GradedQuestion[]
};

const TestResultPage: React.FC = () => {
  const result = MOCK_RESULT; // Thế kết quả thật vào đây sau khi có API

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      {/* HEADER KẾT QUẢ */}
      <div style={styles.header}>
        <h2>Kết Quả Bài Thi</h2>
        <p>Học sinh: <strong>{result.studentName}</strong></p>
        <div style={styles.scoreBox}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
            {result.score} / {result.totalPoints}
          </span>
          <br />
          <small>Điểm số</small>
        </div>
      </div>

      {/* DANH SÁCH CÂU HỎI VÀ ĐÁP ÁN */}
      {result.gradedQuestions.map((q, index) => {
        const isCorrect = q.correctOptionIndex === q.studentOptionIndex;

        return (
          <div key={q.id} style={{ ...styles.questionCard, borderColor: isCorrect ? '#5cb85c' : '#d9534f' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Câu {index + 1}: {q.questionText}</strong>
              <span style={{ color: isCorrect ? '#5cb85c' : '#d9534f', fontWeight: 'bold' }}>
                {isCorrect ? `+${q.points}đ` : '0đ'}
              </span>
            </div>

            <div style={{ marginTop: '10px' }}>
              {q.options.map((option, optIndex) => {
                const isSystemCorrect = optIndex === q.correctOptionIndex;
                const isStudentSelected = optIndex === q.studentOptionIndex;

                // Logic tô màu
                let backgroundColor = '#fff';
                let borderColor = '#ccc';
                if (isSystemCorrect) {
                  backgroundColor = '#e8f5e9'; // Xanh lá nhạt cho đáp án đúng
                  borderColor = '#4caf50';
                } else if (isStudentSelected && !isCorrect) {
                  backgroundColor = '#ffebee'; // Đỏ nhạt cho đáp án học sinh chọn sai
                  borderColor = '#f44336';
                }

                return (
                  <div key={optIndex} style={{ ...styles.optionRow, backgroundColor, borderColor }}>
                    <input
                      type="radio"
                      checked={isStudentSelected}
                      disabled // Trang kết quả nên không cho bấm
                      style={{ cursor: 'not-allowed' }}
                    />
                    <span style={{ marginLeft: '10px', flex: 1 }}>{option}</span>
                    
                    {/* Badge hiển thị text */}
                    {isSystemCorrect && <span style={{ color: '#2e7d32', fontSize: '12px', fontWeight: 'bold' }}>[Đáp án đúng]</span>}
                    {isStudentSelected && !isCorrect && <span style={{ color: '#c62828', fontSize: '12px', fontWeight: 'bold' }}>[Lựa chọn của bạn]</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button style={styles.backBtn} onClick={() => alert('Quay lại trang chủ')}>Quay lại trang chủ</button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: { textAlign: 'center', background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' },
  scoreBox: { background: '#fff', display: 'inline-block', padding: '10px 20px', borderRadius: '50px', marginTop: '10px', border: '2px solid #e9ecef' },
  questionCard: { background: '#fff', border: '2px solid', borderRadius: '8px', padding: '15px', marginBottom: '15px' },
  optionRow: { display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid', borderRadius: '4px', marginBottom: '5px' },
  backBtn: { padding: '10px 20px', background: '#0275d8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default TestResultPage;