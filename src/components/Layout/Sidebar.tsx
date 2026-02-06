import { Home, LayoutDashboard, MessageSquare, FileText, Video, TrendingUp, Award, TrendingUp as Logo } from 'lucide-react';

type SidebarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

const menuItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'consultation', icon: MessageSquare, label: 'Career Consultation' },
  { id: 'resume', icon: FileText, label: 'Resume Builder' },
  { id: 'interview', icon: Video, label: 'Interview Prep' },
  { id: 'career-path', icon: TrendingUp, label: 'Career Path' },
  { id: 'assessment', icon: Award, label: 'Skill Assessment' },
];

export const Sidebar = ({ currentPage, onNavigate }: SidebarProps) => {
  return (
    <div className="w-64 bg-slate-900 min-h-screen text-white flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Logo className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold">CareerPath Pro</span>
      </div>

      <nav className="flex-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
