import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'violet', delay = 0 }) {
  const colors = {
    violet: 'from-violet-600/20 to-violet-600/5 border-violet-500/20',
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/20',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20',
  };
  const iconColors = { violet: 'text-violet-400', blue: 'text-blue-400', emerald: 'text-emerald-400', amber: 'text-amber-400' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={clsx('rounded-xl border bg-gradient-to-br p-5', colors[color])}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-white/50">{title}</p>
        {Icon && <Icon size={18} className={iconColors[color]} />}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span className={clsx('flex items-center gap-0.5 text-xs font-medium', trend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
        {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
