import { useState, useEffect } from 'react';
import { Award, CheckCircle, BarChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Assessment } from '../lib/supabase';

type Question = {
  question: string;
  options: string[];
  category: string;
};

const assessmentQuestions: Record<string, Question[]> = {
  'Technical Skills': [
    {
      question: 'How comfortable are you with version control systems (Git)?',
      options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      category: 'Development Tools',
    },
    {
      question: 'Rate your experience with database design and SQL',
      options: ['No experience', 'Basic queries', 'Complex queries', 'Database architecture'],
      category: 'Databases',
    },
    {
      question: 'How would you rate your problem-solving abilities?',
      options: ['Developing', 'Competent', 'Strong', 'Exceptional'],
      category: 'Core Skills',
    },
    {
      question: 'Experience with API development and integration?',
      options: ['None', 'Basic REST APIs', 'Advanced APIs', 'Microservices'],
      category: 'Backend',
    },
  ],
  'Soft Skills': [
    {
      question: 'How do you handle difficult conversations?',
      options: ['Avoid them', 'With preparation', 'Confidently', 'Lead with empathy'],
      category: 'Communication',
    },
    {
      question: 'Rate your ability to work in a team',
      options: ['Prefer solo work', 'Can collaborate', 'Team player', 'Team leader'],
      category: 'Collaboration',
    },
    {
      question: 'How do you manage your time and priorities?',
      options: ['Reactive', 'Some planning', 'Well organized', 'Strategic planner'],
      category: 'Time Management',
    },
    {
      question: 'How do you approach learning new skills?',
      options: ['When required', 'Occasional learning', 'Regular learner', 'Continuous learning'],
      category: 'Growth Mindset',
    },
  ],
  'Leadership': [
    {
      question: 'Have you mentored or coached others?',
      options: ['No experience', 'Informal mentoring', 'Regular mentoring', 'Formal leadership'],
      category: 'Mentorship',
    },
    {
      question: 'How do you handle project deadlines?',
      options: ['Often miss them', 'Usually meet them', 'Always meet them', 'Exceed expectations'],
      category: 'Accountability',
    },
    {
      question: 'Rate your strategic thinking abilities',
      options: ['Tactical focus', 'Some strategy', 'Strategic thinking', 'Visionary'],
      category: 'Strategy',
    },
    {
      question: 'How comfortable are you making important decisions?',
      options: ['Prefer guidance', 'Can decide', 'Confident decider', 'Strategic decision maker'],
      category: 'Decision Making',
    },
  ],
};

export const AssessmentPage = () => {
  const { profile } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [assessmentActive, setAssessmentActive] = useState(false);
  const [results, setResults] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      setAssessments(data);
    }
  };

  const startAssessment = () => {
    if (!selectedType) return;
    setAssessmentActive(true);
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
  };

  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleNext = () => {
    const questions = assessmentQuestions[selectedType];
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const completeAssessment = async () => {
    if (!profile || !selectedType) return;

    const questions = assessmentQuestions[selectedType];
    const categoryScores: Record<string, { total: number; count: number }> = {};

    questions.forEach((q, index) => {
      const answer = answers[index] || 0;
      const score = (answer / 3) * 100;

      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { total: 0, count: 0 };
      }
      categoryScores[q.category].total += score;
      categoryScores[q.category].count += 1;
    });

    const calculatedResults: Record<string, number> = {};
    Object.keys(categoryScores).forEach((category) => {
      calculatedResults[category] = Math.round(
        categoryScores[category].total / categoryScores[category].count
      );
    });

    calculatedResults.overall = Math.round(
      Object.values(calculatedResults).reduce((sum, score) => sum + score, 0) /
        Object.keys(calculatedResults).length
    );

    await supabase.from('assessments').insert([
      {
        user_id: profile.id,
        assessment_type: selectedType,
        questions: questions.map(q => q.question),
        answers: Object.values(answers),
        results: calculatedResults,
        completed_at: new Date().toISOString(),
      },
    ]);

    setResults(calculatedResults);
    setAssessmentActive(false);
    await loadAssessments();
  };

  if (!assessmentActive && !results) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Assessment</h1>
          <p className="text-gray-600 mb-8">Evaluate your skills and identify areas for growth</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Object.keys(assessmentQuestions).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-6 border-2 rounded-xl transition-all text-left ${
                  selectedType === type
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{type}</h3>
                <p className="text-sm text-gray-600">
                  {assessmentQuestions[type].length} questions
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={startAssessment}
            disabled={!selectedType}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Assessment
          </button>

          {assessments.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Past Assessments</h2>
              <div className="space-y-4">
                {assessments.map((assessment) => {
                  const assessmentResults = assessment.results as Record<string, number>;
                  return (
                    <div
                      key={assessment.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {assessment.assessment_type}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Completed {new Date(assessment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {assessmentResults.overall}%
                          </div>
                          <div className="text-sm text-gray-500">Overall Score</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(assessmentResults)
                          .filter(([key]) => key !== 'overall')
                          .map(([category, score]) => (
                            <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-semibold text-gray-900">{score}%</div>
                              <div className="text-xs text-gray-600">{category}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (assessmentActive) {
    const questions = assessmentQuestions[selectedType];
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
              <span className="text-sm font-medium text-blue-600">{selectedType}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {currentQ.category}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{currentQ.question}</h2>

            <div className="space-y-3 mb-8">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    answers[currentQuestion] === index
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {answers[currentQuestion] === index ? (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className="font-medium text-gray-900">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={answers[currentQuestion] === undefined}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
            <p className="text-gray-600 mb-8">Here are your results</p>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-8">
              <div className="text-sm font-medium mb-2">Overall Score</div>
              <div className="text-6xl font-bold mb-2">{results.overall}%</div>
              <div className="text-blue-100">
                {results.overall >= 75
                  ? 'Excellent! Your skills are strong in this area.'
                  : results.overall >= 50
                  ? 'Good! There are opportunities to develop further.'
                  : 'Keep learning! Focus on building these skills.'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {Object.entries(results)
                .filter(([key]) => key !== 'overall')
                .map(([category, score]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{score}%</div>
                  </div>
                ))}
            </div>

            <button
              onClick={() => {
                setResults(null);
                setSelectedType('');
              }}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Take Another Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
