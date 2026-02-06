import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const ConsultationPage = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI career coach. How can I help you today? You can ask me about career transitions, skill development, job search strategies, or any other career-related questions.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOrCreateConsultation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadOrCreateConsultation = async () => {
    if (!profile) return;

    const { data: existingConsultations } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingConsultations && existingConsultations.length > 0) {
      const consultation = existingConsultations[0];
      setConsultationId(consultation.id);
      if (consultation.messages && Array.isArray(consultation.messages) && consultation.messages.length > 0) {
        setMessages(consultation.messages as Message[]);
      }
    } else {
      const { data: newConsultation } = await supabase
        .from('consultations')
        .insert([
          {
            user_id: profile.id,
            topic: 'General Career Consultation',
            messages: messages,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (newConsultation) {
        setConsultationId(newConsultation.id);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !profile || !consultationId) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const aiResponse = generateAIResponse(input);
    const assistantMessage: Message = { role: 'assistant', content: aiResponse };
    const finalMessages = [...updatedMessages, assistantMessage];
    setMessages(finalMessages);

    await supabase
      .from('consultations')
      .update({ messages: finalMessages, updated_at: new Date().toISOString() })
      .eq('id', consultationId);

    setLoading(false);
  };

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('career change') || lowerQuery.includes('transition')) {
      return 'Career transitions can be exciting! Here are some key steps: 1) Identify transferable skills from your current role, 2) Research the target industry and role requirements, 3) Network with professionals in your desired field, 4) Consider additional certifications or training if needed, 5) Update your resume to highlight relevant experience. What specific field are you interested in transitioning to?';
    }

    if (lowerQuery.includes('resume') || lowerQuery.includes('cv')) {
      return 'A strong resume should: 1) Start with a compelling summary highlighting your key strengths, 2) Use action verbs and quantify achievements, 3) Tailor content to each job application, 4) Keep it concise (1-2 pages), 5) Include relevant keywords from the job description. Would you like help with a specific section of your resume?';
    }

    if (lowerQuery.includes('interview')) {
      return 'Interview preparation is crucial! Here are my tips: 1) Research the company thoroughly, 2) Practice common interview questions, 3) Prepare specific examples using the STAR method, 4) Dress appropriately, 5) Prepare thoughtful questions for the interviewer. Would you like to practice some interview questions?';
    }

    if (lowerQuery.includes('skill') || lowerQuery.includes('learning')) {
      return 'Continuous learning is key to career growth! Consider: 1) Identifying in-demand skills in your field, 2) Taking online courses (Coursera, Udemy, LinkedIn Learning), 3) Working on practical projects, 4) Seeking mentorship, 5) Attending industry events and webinars. What specific skills are you looking to develop?';
    }

    if (lowerQuery.includes('salary') || lowerQuery.includes('negotiation')) {
      return 'Salary negotiation tips: 1) Research market rates for your role and location, 2) Know your worth and be confident, 3) Consider the entire compensation package, 4) Wait for the offer before discussing numbers, 5) Practice your negotiation conversation. Would you like help preparing for a salary negotiation?';
    }

    return 'That\'s a great question! Career development is a journey that requires planning and continuous improvement. I recommend: 1) Setting clear short-term and long-term goals, 2) Building a strong professional network, 3) Staying updated with industry trends, 4) Seeking feedback regularly, 5) Maintaining work-life balance. Could you tell me more about your specific situation so I can provide more targeted advice?';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Consultation</h1>
        <p className="text-gray-600">Get personalized career guidance from your AI coach</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-2xl px-6 py-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me anything about your career..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
