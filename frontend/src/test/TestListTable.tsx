// src/components/test/TestListTable.tsx
import React from 'react';
import type { TestItem } from '../../types/test';

interface TestListTableProps {
  tests: TestItem[];
  onEdit: (test: TestItem) => void;
  onDelete: (test: TestItem) => void;
  onManageQuestions: (testId: number) => void; // Thêm nút này để sang màn hình nhập câu hỏi
}

const TestListTable: React.FC<TestListTableProps> = ({ tests, onEdit, onDelete, onManageQuestions }) => {
  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Thông tin bài thi</th>
            <th style={styles.th}>Passcode</th>
            <th style={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {tests.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Chưa có bài thi nào.</td>
            </tr>
          ) : (
            tests.map((test) => (
              <tr key={test.id} style={styles.row}>
                <td style={styles.td}>{test.id}</td>
                <td style={styles.td}>
                  <div style={styles.title}>{test.title}</div>
                  <div style={styles.description}>{test.description}</div>
                </td>
                <td style={styles.td}>
                  <span style={styles.badge}>{test.passcode}</span>
                </td>
                <td style={styles.td}>
                  <button onClick={() => onManageQuestions(test.id)} style={styles.manageBtn}>Câu hỏi</button>
                  <button onClick={() => onEdit(test)} style={styles.editBtn}>Sửa</button>
                  <button onClick={() => onDelete(test)} style={styles.deleteBtn}>Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { overflowX: 'auto', marginTop: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  headerRow: { background: '#f4f7f6', textAlign: 'left' },
  th: { padding: '15px', borderBottom: '1px solid #eee', fontWeight: 600, color: '#333' },
  td: { padding: '15px', borderBottom: '1px solid #eee' },
  row: { transition: 'background 0.2s' },
  title: { fontWeight: 'bold', color: '#2c3e50' },
  description: { fontSize: '0.85rem', color: '#7f8c8d' },
  badge: { background: '#e1f5fe', color: '#0288d1', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' },
  manageBtn: { marginRight: '5px', padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  editBtn: { marginRight: '5px', padding: '6px 12px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default TestListTable;