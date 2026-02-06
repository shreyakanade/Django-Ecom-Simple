import { useEffect, useState } from 'react';
import { FileText, MessageSquare, Video, Award, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Stats = {
  resumes: number;
  consultations: number;
  interviewSessions: number;
  assessments: number;
};

type HomePageProps = {
  onNavigate: (page: string) => void;
};

export const HomePage = ({ onNavigate }: HomePageProps) => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    resumes: 0,
    consultations: 0,
    interviewSessions: 0,
    assessments: 0,
  });
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    loadStats();
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const loadStats = async () => {
    if (!profile) return;

    const [resumes, consultations, interviews, assessments] = await Promise.all([
      supabase.from('resumes').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
      supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
      supabase.from('interview_sessions').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
      supabase.from('assessments').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
    ]);

    setStats({
      resumes: resumes.count || 0,
      consultations: consultations.count || 0,
      interviewSessions: interviews.count || 0,
      assessments: assessments.count || 0,
    });
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const statCards = [
    { icon: FileText, label: 'Resumes', count: stats.resumes },
    { icon: MessageSquare, label: 'Consultations', count: stats.consultations },
    { icon: Video, label: 'Interview Sessions', count: stats.interviewSessions },
    { icon: Award, label: 'Assessments', count: stats.assessments },
  ];

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Start Consultation',
      description: 'Get AI-powered career advice',
      page: 'consultation',
    },
    {
      icon: FileText,
      title: 'Build Resume',
      description: 'Create or edit your resume',
      page: 'resume',
    },
    {
      icon: Video,
      title: 'Practice Interview',
      description: 'Prepare for your next interview',
      page: 'interview',
    },
    {
      icon: TrendingUp,
      title: 'Explore Career Paths',
      description: 'Discover your career options',
      page: 'career-path',
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {firstName}!
          </h1>
          <p className="text-lg text-gray-600">Continue your career development journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-gray-600 text-sm font-medium">{card.label}</div>
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{card.count}</div>
              </div>
            );
          })}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => onNavigate(action.page)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:scale-105 text-left group"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                    Get Started <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Getting Started</h2>
          <p className="text-gray-600">Complete these steps to make the most of CareerPath Pro</p>
        </div>
      </div>

      {showWelcome && (
        <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm animate-slide-up">
          <h3 className="font-semibold text-gray-900 mb-1">Welcome back!</h3>
          <p className="text-sm text-gray-600">You have successfully signed in.</p>
        </div>
      )}
    </div>
  );
};
