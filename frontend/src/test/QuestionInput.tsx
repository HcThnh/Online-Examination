// src/components/test/QuestionInput.tsx
import React from 'react';

// Định nghĩa Interface cho Câu hỏi dựa trên Backend QuestionRequest
export interface QuestionData {
  id?: number; // Có id nếu là sửa, không có nếu là thêm mới
  questionText: string;
  points: number;
  options: string[];
  correctOptionIndex: number;
}

interface QuestionInputProps {
  index: number; // Thứ tự câu hỏi (Câu 1, Câu 2...)
  data: QuestionData;
  onChange: (updatedData: QuestionData) => void;
  onRemove: () => void;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ index, data, onChange, onRemove }) => {
  
  // Xử lý thay đổi nội dung text của câu hỏi
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...data, questionText: e.target.value });
  };

  // Xử lý thay đổi điểm
  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, points: Number(e.target.value) });
  };

  // Xử lý thay đổi nội dung các đáp án (A, B, C, D)
  const handleOptionChange = (optIndex: number, value: string) => {
    const newOptions = [...data.options];
    newOptions[optIndex] = value;
    onChange({ ...data, options: newOptions });
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.questionNumber}>Câu hỏi {index + 1}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '14px' }}>Điểm:</label>
          <input 
            type="number" 
            value={data.points} 
            onChange={handlePointsChange} 
            style={styles.pointsInput} 
          />
          <button onClick={onRemove} style={styles.removeBtn}>&times;</button>
        </div>
      </div>

      <textarea
        placeholder="Nhập nội dung câu hỏi..."
        value={data.questionText}
        onChange={handleTextChange}
        style={styles.textarea}
        rows={3}
      />

      <div style={styles.optionsGrid}>
        {data.options.map((option, optIndex) => (
          <div key={optIndex} style={styles.optionRow}>
            <input
              type="radio"
              name={`correct-opt-${index}`} // Đảm bảo radio chỉ chọn 1 trong 4 của chính nó
              checked={data.correctOptionIndex === optIndex}
              onChange={() => onChange({ ...data, correctOptionIndex: optIndex })}
              style={styles.radio}
            />
            <input
              type="text"
              placeholder={`Đáp án ${String.fromCharCode(65 + optIndex)}`} // A, B, C, D
              value={option}
              onChange={(e) => handleOptionChange(optIndex, e.target.value)}
              style={styles.optInput}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: { background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  questionNumber: { fontWeight: 'bold', color: '#444' },
  pointsInput: { width: '50px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' },
  removeBtn: { background: 'none', border: 'none', fontSize: '20px', color: '#999', cursor: 'pointer' },
  textarea: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
  optionsGrid: { marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  optionRow: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f9f9f9', padding: '8px', borderRadius: '4px' },
  radio: { width: '18px', height: '18px', cursor: 'pointer' },
  optInput: { flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }
};

export default QuestionInput;