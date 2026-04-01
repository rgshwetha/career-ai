import clsx from 'clsx';

export default function Card({ children, className, glass = false }) {
  return (
    <div className={clsx(
      'rounded-xl border',
      glass
        ? 'bg-white/5 border-white/10 backdrop-blur-sm'
        : 'bg-[hsl(240_10%_6%)] border-white/5',
      className
    )}>
      {children}
    </div>
  );
}
