import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <TeacherDashboard/>
      </Router>
    </AuthProvider>
  );
}

export default App;
