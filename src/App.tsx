import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { ConsultationPage } from './pages/ConsultationPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { InterviewPrepPage } from './pages/InterviewPrepPage';
import { CareerPathPage } from './pages/CareerPathPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { MainLayout } from './components/Layout/MainLayout';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
      case 'dashboard':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'consultation':
        return <ConsultationPage />;
      case 'resume':
        return <ResumeBuilderPage />;
      case 'interview':
        return <InterviewPrepPage />;
      case 'career-path':
        return <CareerPathPage />;
      case 'assessment':
        return <AssessmentPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
