import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header = () => {
  const { profile, signOut } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-end">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {getInitials(profile?.full_name || null)}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">{profile?.full_name || 'User'}</p>
            <p className="text-gray-500">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
