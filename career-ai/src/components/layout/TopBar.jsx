import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

const TITLES = {
  '/': 'Dashboard',
  '/skills': 'Skills',
  '/learning': 'Learning Paths',
  '/jobs': 'Job Matches',
  '/assistant': 'AI Assistant',
  '/analytics': 'Analytics',
  '/documents': 'Documents',
  '/settings': 'Settings',
};

export default function TopBar() {
  const location = useLocation();
  const title = TITLES[location.pathname] || 'CareerAI';

  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[hsl(240_10%_4%)] shrink-0">
      <h1 className="text-white font-semibold text-base">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
          <Search size={15} />
        </button>
        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold">
            AJ
          </div>
          <span className="text-sm text-white/70">Alex J.</span>
        </div>
      </div>
    </header>
  );
}
