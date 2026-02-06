import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CareerPath } from '../lib/supabase';

type RoadmapStep = {
  title: string;
  description: string;
  duration: string;
  completed: boolean;
};

const careerPathTemplates: Record<string, { target: string; roadmap: RoadmapStep[] }[]> = {
  'Junior Developer': [
    {
      target: 'Senior Developer',
      roadmap: [
        {
          title: 'Master Core Technologies',
          description: 'Deepen knowledge in your primary programming language and frameworks',
          duration: '6-12 months',
          completed: false,
        },
        {
          title: 'Learn System Design',
          description: 'Study scalable architecture patterns and design principles',
          duration: '3-6 months',
          completed: false,
        },
        {
          title: 'Mentorship & Code Reviews',
          description: 'Start mentoring junior developers and leading code reviews',
          duration: '6 months',
          completed: false,
        },
        {
          title: 'Lead Projects',
          description: 'Take ownership of significant features or projects',
          duration: '6-12 months',
          completed: false,
        },
      ],
    },
  ],
  'Marketing Coordinator': [
    {
      target: 'Marketing Manager',
      roadmap: [
        {
          title: 'Develop Strategic Skills',
          description: 'Learn campaign planning and market analysis',
          duration: '6 months',
          completed: false,
        },
        {
          title: 'Build Leadership Experience',
          description: 'Lead small teams and cross-functional projects',
          duration: '6-12 months',
          completed: false,
        },
        {
          title: 'Master Analytics',
          description: 'Become proficient in marketing analytics and ROI measurement',
          duration: '4-6 months',
          completed: false,
        },
        {
          title: 'Expand Industry Knowledge',
          description: 'Stay updated with industry trends and best practices',
          duration: 'Ongoing',
          completed: false,
        },
      ],
    },
  ],
  'Product Analyst': [
    {
      target: 'Product Manager',
      roadmap: [
        {
          title: 'Understand Product Lifecycle',
          description: 'Learn all stages from ideation to launch',
          duration: '4-6 months',
          completed: false,
        },
        {
          title: 'Develop Stakeholder Management',
          description: 'Build relationships and communication skills',
          duration: '6 months',
          completed: false,
        },
        {
          title: 'Lead Feature Development',
          description: 'Own end-to-end delivery of product features',
          duration: '8-12 months',
          completed: false,
        },
        {
          title: 'Build Strategic Thinking',
          description: 'Learn to balance user needs with business goals',
          duration: '6-12 months',
          completed: false,
        },
      ],
    },
  ],
};

export const CareerPathPage = () => {
  const { profile } = useAuth();
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPosition, setCurrentPosition] = useState('');
  const [targetRole, setTargetRole] = useState('');

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('career_paths')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      setPaths(data);
      if (data.length > 0 && !selectedPath) {
        setSelectedPath(data[0]);
      }
    }
  };

  const createPath = async () => {
    if (!profile || !currentPosition || !targetRole) return;

    const template = careerPathTemplates[currentPosition]?.[0];
    const roadmap = template ? template.roadmap : [];

    const { data } = await supabase
      .from('career_paths')
      .insert([
        {
          user_id: profile.id,
          current_position: currentPosition,
          target_role: targetRole,
          roadmap,
          progress: 0,
        },
      ])
      .select()
      .single();

    if (data) {
      await loadPaths();
      setSelectedPath(data);
      setShowCreateForm(false);
      setCurrentPosition('');
      setTargetRole('');
    }
  };

  const updateProgress = async (stepIndex: number) => {
    if (!selectedPath) return;

    const updatedRoadmap = [...(selectedPath.roadmap as RoadmapStep[])];
    updatedRoadmap[stepIndex].completed = !updatedRoadmap[stepIndex].completed;

    const completedSteps = updatedRoadmap.filter(step => step.completed).length;
    const progress = Math.round((completedSteps / updatedRoadmap.length) * 100);

    await supabase
      .from('career_paths')
      .update({
        roadmap: updatedRoadmap,
        progress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedPath.id);

    await loadPaths();
  };

  if (paths.length === 0 && !showCreateForm) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Path</h1>
          <p className="text-gray-600 mb-8">Map your journey to your dream role</p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Career Journey</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create a personalized roadmap to reach your career goals with step-by-step guidance
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Career Path
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Career Path</h1>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Position
                </label>
                <select
                  value={currentPosition}
                  onChange={(e) => setCurrentPosition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your current role</option>
                  {Object.keys(careerPathTemplates).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Developer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {currentPosition && careerPathTemplates[currentPosition] && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Suggested Roadmap Preview</h3>
                  <div className="space-y-2">
                    {careerPathTemplates[currentPosition][0].roadmap.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <Circle className="w-4 h-4" />
                        <span>{step.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={createPath}
                  disabled={!currentPosition || !targetRole}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Path
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roadmap = selectedPath?.roadmap as RoadmapStep[] || [];
  const completedSteps = roadmap.filter(step => step.completed).length;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Path</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <span>{selectedPath?.current_position}</span>
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">{selectedPath?.target_role}</span>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            New Path
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Progress</h2>
            <span className="text-2xl font-bold text-blue-600">{selectedPath?.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${selectedPath?.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {completedSteps} of {roadmap.length} steps completed
          </p>
        </div>

        <div className="space-y-6">
          {roadmap.map((step, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${
                step.completed ? 'border-green-200 bg-green-50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => updateProgress(index)}
                  className="flex-shrink-0 mt-1"
                >
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <span className="text-sm text-gray-500">{step.duration}</span>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
