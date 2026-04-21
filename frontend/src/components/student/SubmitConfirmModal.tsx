// src/components/student/SubmitConfirmModal.tsx
import React from 'react';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  onClose: () => void;
  onConfirm: () => void;
}

const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  totalQuestions,
  answeredQuestions,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  const isComplete = answeredQuestions === totalQuestions;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Xác nhận nộp bài?</h3>
        
        <p style={{ fontSize: '16px' }}>
          Bạn đã hoàn thành <strong>{answeredQuestions}/{totalQuestions}</strong> câu hỏi.
        </p>

        {!isComplete && (
          <p style={{ color: '#d9534f', fontWeight: 'bold' }}>
            ⚠️ Chú ý: Bạn vẫn còn câu hỏi chưa trả lời!
          </p>
        )}

        <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
          Sau khi nộp bài, bạn sẽ không thể thay đổi đáp án được nữa.
        </p>
        
        <div style={styles.buttonGroup}>
          <button style={styles.cancelBtn} onClick={onClose}>Tiếp tục làm bài</button>
          <button style={styles.submitBtn} onClick={onConfirm}>Đồng ý nộp bài</button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  cancelBtn: { padding: '8px 16px', cursor: 'pointer', border: '1px solid #ccc', background: 'white', borderRadius: '4px' },
  submitBtn: { padding: '8px 16px', cursor: 'pointer', border: 'none', background: '#5cb85c', color: 'white', borderRadius: '4px' }
};

export default SubmitConfirmModal;