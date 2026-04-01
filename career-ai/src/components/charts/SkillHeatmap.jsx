import { motion } from 'framer-motion';
import Card from '../ui/Card';
import clsx from 'clsx';

function heatColor(v) {
  if (v >= 80) return 'bg-emerald-500/80 border-emerald-400/30';
  if (v >= 60) return 'bg-violet-500/70 border-violet-400/30';
  if (v >= 40) return 'bg-amber-500/60 border-amber-400/30';
  return 'bg-red-500/50 border-red-400/30';
}

export default function SkillHeatmap({ skills }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-white/80 mb-4">Skill Heatmap</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            title={`${skill.name}: ${skill.strength}%`}
            className={clsx('px-2.5 py-1.5 rounded-lg border text-xs font-medium text-white cursor-default', heatColor(skill.strength))}
          >
            {skill.name}
            <span className="ml-1.5 opacity-70">{skill.strength}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
        {[['80+', 'bg-emerald-500/80', 'Expert'], ['60–79', 'bg-violet-500/70', 'Proficient'], ['40–59', 'bg-amber-500/60', 'Learning'], ['<40', 'bg-red-500/50', 'Beginner']].map(([range, cls, label]) => (
          <div key={range} className="flex items-center gap-1.5">
            <div className={clsx('w-3 h-3 rounded', cls)} />
            <span className="text-xs text-white/40">{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
