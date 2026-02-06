import { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, InterviewSession } from '../lib/supabase';

type Question = {
  question: string;
  category: string;
};

const interviewQuestions: Record<string, Question[]> = {
  'Software Engineer': [
    { question: 'Tell me about a challenging technical problem you solved.', category: 'Technical' },
    { question: 'How do you approach code reviews?', category: 'Collaboration' },
    { question: 'Describe your experience with agile methodologies.', category: 'Process' },
    { question: 'What is your approach to learning new technologies?', category: 'Growth' },
  ],
  'Product Manager': [
    { question: 'How do you prioritize features for a product roadmap?', category: 'Strategy' },
    { question: 'Describe a time when you had to make a difficult product decision.', category: 'Decision Making' },
    { question: 'How do you balance user needs with business goals?', category: 'Vision' },
    { question: 'Tell me about a product launch you managed.', category: 'Execution' },
  ],
  'Marketing Manager': [
    { question: 'How do you measure the success of a marketing campaign?', category: 'Analytics' },
    { question: 'Describe your experience with digital marketing channels.', category: 'Channels' },
    { question: 'How do you approach building a brand strategy?', category: 'Strategy' },
    { question: 'Tell me about a successful campaign you led.', category: 'Leadership' },
  ],
};

export const InterviewPrepPage = () => {
  const { profile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [sessionActive, setSessionActive] = useState(false);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSessions(data);
    }
  };

  const startSession = () => {
    if (!selectedRole) return;
    setSessionActive(true);
    setCurrentQuestion(0);
    setResponses({});
    setFeedback('');
  };

  const handleNextQuestion = () => {
    const questions = interviewQuestions[selectedRole];
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    if (!profile || !selectedRole) return;

    const questions = interviewQuestions[selectedRole];
    const responseArray = questions.map((q, i) => ({
      question: q.question,
      answer: responses[i] || '',
    }));

    const generatedFeedback = generateFeedback(responseArray);
    const score = calculateScore(responseArray);

    await supabase.from('interview_sessions').insert([
      {
        user_id: profile.id,
        job_role: selectedRole,
        questions: questions.map(q => q.question),
        responses: responseArray,
        feedback: generatedFeedback,
        score,
        completed_at: new Date().toISOString(),
      },
    ]);

    setFeedback(generatedFeedback);
    setSessionActive(false);
    await loadSessions();
  };

  const generateFeedback = (responses: Array<{ question: string; answer: string }>) => {
    const answeredCount = responses.filter(r => r.answer.trim().length > 0).length;
    const avgLength = responses.reduce((sum, r) => sum + r.answer.length, 0) / responses.length;

    let feedback = 'Interview Practice Completed!\n\n';
    feedback += `Questions Answered: ${answeredCount}/${responses.length}\n`;
    feedback += `Average Response Length: ${Math.round(avgLength)} characters\n\n`;

    if (avgLength < 100) {
      feedback += 'Tip: Try to provide more detailed responses. Use the STAR method (Situation, Task, Action, Result) to structure your answers.\n';
    } else if (avgLength > 500) {
      feedback += 'Tip: While detail is good, try to be more concise. Aim for clear, focused responses.\n';
    } else {
      feedback += 'Great job! Your response length is appropriate. Keep practicing to improve your delivery.\n';
    }

    return feedback;
  };

  const calculateScore = (responses: Array<{ question: string; answer: string }>) => {
    const answeredCount = responses.filter(r => r.answer.trim().length > 0).length;
    const avgLength = responses.reduce((sum, r) => sum + r.answer.length, 0) / responses.length;

    let score = (answeredCount / responses.length) * 50;

    if (avgLength >= 100 && avgLength <= 500) {
      score += 30;
    } else if (avgLength > 50) {
      score += 15;
    }

    score += Math.min(20, responses.length * 5);

    return Math.min(100, Math.round(score));
  };

  if (!sessionActive && !feedback && sessions.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Practice</h1>
          <p className="text-gray-600 mb-8">Prepare for your next interview with AI-powered practice</p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select a Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {Object.keys(interviewQuestions).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    selectedRole === role
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{role}</h3>
                  <p className="text-sm text-gray-600">
                    {interviewQuestions[role].length} questions
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={startSession}
              disabled={!selectedRole}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              Start Interview Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sessionActive) {
    const questions = interviewQuestions[selectedRole];
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-blue-600">{selectedRole}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {currentQ.category}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentQ.question}</h2>

            <textarea
              value={responses[currentQuestion] || ''}
              onChange={(e) =>
                setResponses({ ...responses, [currentQuestion]: e.target.value })
              }
              placeholder="Type your answer here... Try to use the STAR method (Situation, Task, Action, Result)"
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentQuestion === questions.length - 1 ? 'Complete' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (feedback) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Practice Completed!</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{feedback}</pre>
            </div>
            <button
              onClick={() => {
                setFeedback('');
                setSelectedRole('');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Practice</h1>
        <p className="text-gray-600 mb-8">Review your past sessions or start a new practice</p>

        <div className="grid grid-cols-1 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.job_role}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Score: {session.score}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setSessionActive(false);
            setFeedback('');
            setSelectedRole('');
          }}
          className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Play className="w-5 h-5" />
          Start New Practice
        </button>
      </div>
    </div>
  );
};
