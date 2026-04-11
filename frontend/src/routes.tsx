import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import EditTest from './pages/EditTest';

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/dashboard/tests/:testId/edit" element={<EditTest />} />

                {/* Tạm thời đá hết mọi đường dẫn sai về đúng trang này để test */}
                <Route path="*" element={<Navigate to="/dashboard/tests/123/edit" replace />} />
            </Routes>
        </BrowserRouter>
    );
}