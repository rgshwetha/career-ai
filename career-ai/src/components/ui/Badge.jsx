import clsx from 'clsx';

const variants = {
  violet: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  blue: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  red: 'bg-red-500/15 text-red-300 border-red-500/20',
  gray: 'bg-white/5 text-white/50 border-white/10',
};

export default function Badge({ children, variant = 'gray', className }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  );
}
