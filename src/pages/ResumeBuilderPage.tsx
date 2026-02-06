import { useState, useEffect } from 'react';
import { Plus, Save, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Resume } from '../lib/supabase';

type ResumeContent = {
  personalInfo?: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills?: string[];
};

export const ResumeBuilderPage = () => {
  const { profile } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ResumeContent>({
    personalInfo: { name: '', email: '', phone: '', location: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', profile.id)
      .order('updated_at', { ascending: false });

    if (data) {
      setResumes(data);
    }
  };

  const handleCreateNew = () => {
    setSelectedResume(null);
    setTitle('My Resume');
    setContent({
      personalInfo: {
        name: profile?.full_name || '',
        email: profile?.email || '',
        phone: '',
        location: '',
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
    });
  };

  const handleSelectResume = (resume: Resume) => {
    setSelectedResume(resume);
    setTitle(resume.title);
    setContent(resume.content as ResumeContent);
  };

  const handleSave = async () => {
    if (!profile || !title) return;

    setSaving(true);

    if (selectedResume) {
      await supabase
        .from('resumes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedResume.id);
    } else {
      const { data } = await supabase
        .from('resumes')
        .insert([
          {
            user_id: profile.id,
            title,
            content,
          },
        ])
        .select()
        .single();

      if (data) {
        setSelectedResume(data);
      }
    }

    await loadResumes();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    await supabase.from('resumes').delete().eq('id', id);
    await loadResumes();

    if (selectedResume?.id === id) {
      handleCreateNew();
    }
  };

  const addExperience = () => {
    setContent({
      ...content,
      experience: [
        ...(content.experience || []),
        { title: '', company: '', duration: '', description: '' },
      ],
    });
  };

  const addEducation = () => {
    setContent({
      ...content,
      education: [
        ...(content.education || []),
        { degree: '', institution: '', year: '' },
      ],
    });
  };

  return (
    <div className="h-full flex bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={handleCreateNew}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Resume
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-sm font-semibold text-gray-600 uppercase mb-3">Your Resumes</h2>
          {resumes.length === 0 ? (
            <p className="text-sm text-gray-500">No resumes yet. Create your first one!</p>
          ) : (
            <div className="space-y-2">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedResume?.id === resume.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <button onClick={() => handleSelectResume(resume)} className="flex-1 text-left">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{resume.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Updated {new Date(resume.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold text-gray-900 border-none focus:outline-none focus:ring-0 px-0"
                  placeholder="Resume Title"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={content.personalInfo?.name || ''}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          personalInfo: { ...content.personalInfo!, name: e.target.value },
                        })
                      }
                      placeholder="Full Name"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      value={content.personalInfo?.email || ''}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          personalInfo: { ...content.personalInfo!, email: e.target.value },
                        })
                      }
                      placeholder="Email"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      value={content.personalInfo?.phone || ''}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          personalInfo: { ...content.personalInfo!, phone: e.target.value },
                        })
                      }
                      placeholder="Phone"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={content.personalInfo?.location || ''}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          personalInfo: { ...content.personalInfo!, location: e.target.value },
                        })
                      }
                      placeholder="Location"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h2>
                  <textarea
                    value={content.summary || ''}
                    onChange={(e) => setContent({ ...content, summary: e.target.value })}
                    placeholder="Write a brief summary about your professional background..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
                    <button
                      onClick={addExperience}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Experience
                    </button>
                  </div>
                  <div className="space-y-4">
                    {content.experience?.map((exp, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const newExperience = [...(content.experience || [])];
                            newExperience[index].title = e.target.value;
                            setContent({ ...content, experience: newExperience });
                          }}
                          placeholder="Job Title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExperience = [...(content.experience || [])];
                            newExperience[index].company = e.target.value;
                            setContent({ ...content, experience: newExperience });
                          }}
                          placeholder="Company"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => {
                            const newExperience = [...(content.experience || [])];
                            newExperience[index].duration = e.target.value;
                            setContent({ ...content, experience: newExperience });
                          }}
                          placeholder="Duration (e.g., Jan 2020 - Present)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <textarea
                          value={exp.description}
                          onChange={(e) => {
                            const newExperience = [...(content.experience || [])];
                            newExperience[index].description = e.target.value;
                            setContent({ ...content, experience: newExperience });
                          }}
                          placeholder="Description and achievements"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                    <button
                      onClick={addEducation}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Education
                    </button>
                  </div>
                  <div className="space-y-4">
                    {content.education?.map((edu, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEducation = [...(content.education || [])];
                            newEducation[index].degree = e.target.value;
                            setContent({ ...content, education: newEducation });
                          }}
                          placeholder="Degree"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEducation = [...(content.education || [])];
                            newEducation[index].institution = e.target.value;
                            setContent({ ...content, education: newEducation });
                          }}
                          placeholder="Institution"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => {
                            const newEducation = [...(content.education || [])];
                            newEducation[index].year = e.target.value;
                            setContent({ ...content, education: newEducation });
                          }}
                          placeholder="Year"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
