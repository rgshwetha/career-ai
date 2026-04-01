import { motion } from 'framer-motion';
import clsx from 'clsx';

export function SkillBar({ value, color = 'violet', animate = true }) {
  const colors = {
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
  };

  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <motion.div
        initial={animate ? { width: 0 } : false}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={clsx('h-full rounded-full', colors[color])}
      />
    </div>
  );
}

export function strengthColor(v) {
  if (v >= 80) return 'emerald';
  if (v >= 60) return 'violet';
  if (v >= 40) return 'amber';
  return 'red';
}
