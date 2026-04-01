import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Brain, Map, Briefcase, MessageSquare,
  BarChart3, FileText, Settings, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/skills', label: 'Skills', icon: Brain },
  { path: '/learning', label: 'Learning Paths', icon: Map },
  { path: '/jobs', label: 'Job Matches', icon: Briefcase },
  { path: '/assistant', label: 'AI Assistant', icon: MessageSquare },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen bg-[hsl(240_10%_5%)] border-r border-white/5 shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
          <Zap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <p className="font-bold text-white text-sm leading-tight">CareerAI</p>
              <p className="text-[10px] text-violet-400">Intelligence System</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <NavLink key={path} to={path}>
              <motion.div
                whileHover={{ x: 2 }}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer',
                  active
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                )}
              >
                <Icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !collapsed && (
                  <motion.div layoutId="activeIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-violet-600 border border-violet-500 flex items-center justify-center text-white hover:bg-violet-500 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
