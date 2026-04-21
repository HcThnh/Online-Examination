// src/components/common/ConfirmDeleteModal.tsx
import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  testName?: string; // Dùng ? vì khi chưa chọn test nào thì nó có thể undefined
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ 
  isOpen, 
  testName, 
  onClose, 
  onConfirm 
}) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{ color: '#d9534f', marginTop: 0 }}>Xác nhận xóa bài thi</h3>
        <p>Bạn có chắc chắn muốn xóa bài thi <strong>"{testName}"</strong> không?</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Hành động này không thể hoàn tác và sẽ xóa toàn bộ câu hỏi, kết quả liên quan.
        </p>
        
        <div style={styles.buttonGroup}>
          <button style={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button style={styles.deleteBtn} onClick={onConfirm}>Đồng ý xóa</button>
        </div>
      </div>
    </div>
  );
};

// Định nghĩa type cho style để TS không báo lỗi
const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  cancelBtn: { padding: '8px 16px', cursor: 'pointer', border: '1px solid #ccc', background: 'white', borderRadius: '4px' },
  deleteBtn: { padding: '8px 16px', cursor: 'pointer', border: 'none', background: '#d9534f', color: 'white', borderRadius: '4px' }
};

export default ConfirmDeleteModal;