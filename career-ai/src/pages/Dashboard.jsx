import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Map, Briefcase, Zap, Clock } from 'lucide-react';
import { db } from '../lib/store';
import StatCard from '../components/ui/StatCard';
import SkillRadar from '../components/charts/SkillRadar';
import SkillHeatmap from '../components/charts/SkillHeatmap';
import ProgressChart from '../components/charts/ProgressChart';
import Card from '../components/ui/Card';

const ACTIVITY_ICONS = { skill: Brain, path: Map, job: Briefcase, profile: Zap };
const ACTIVITY_COLORS = { skill: 'text-violet-400', path: 'text-blue-400', job: 'text-emerald-400', profile: 'text-amber-400' };

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function RecentActivity({ activity }) {
  return (
    <Card className="p-5 flex flex-col h-full">
      <p className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
        <Clock size={14} /> Recent Activity
      </p>
      <div className="space-y-1 flex-1 overflow-y-auto">
        {activity.slice(0, 10).map((item, i) => {
          const Icon = ACTIVITY_ICONS[item.type] || Zap;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0"
            >
              <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={12} className={ACTIVITY_COLORS[item.type] || 'text-white/40'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{item.label}</p>
                {item.sub && <p className="text-xs text-white/40 truncate">{item.sub}</p>}
              </div>
              <span className="text-xs text-white/25 shrink-0 mt-0.5">{timeAgo(item.ts)}</span>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: () => db.skills.list() });
  const { data: paths = [] } = useQuery({ queryKey: ['paths'], queryFn: () => db.paths.list() });
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: () => db.jobs.list() });
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => db.profile.get() });
  const { data: activity = [] } = useQuery({ queryKey: ['activity'], queryFn: () => db.activity.list() });
  const { data: skillHistory = [] } = useQuery({ queryKey: ['skillHistory'], queryFn: () => db.skillHistory.get() });

  // All stats derived from real data
  const avgStrength = skills.length
    ? Math.round(skills.reduce((a, s) => a + s.strength, 0) / skills.length)
    : 0;

  const activePaths = paths.filter(p => p.status === 'active');
  const avgProgress = activePaths.length
    ? Math.round(activePaths.reduce((a, p) => a + p.progress, 0) / activePaths.length)
    : 0;

  const bestMatch = jobs.length ? Math.max(...jobs.map(j => j.match_score)) : 0;
  const bestMatchJob = jobs.find(j => j.match_score === bestMatch);

  // Skill decay alert — skills with freshness < 50
  const decayingSkills = skills.filter(s => s.freshness < 50);

  const firstName = profile?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">{greeting()}, {firstName} 👋</h2>
          <p className="text-white/40 text-sm mt-1">
            {profile?.target_role
              ? `Tracking your path to ${profile.target_role}`
              : "Here's your career intelligence overview"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {decayingSkills.length > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
              ⚠ {decayingSkills.length} skill{decayingSkills.length > 1 ? 's' : ''} need refreshing
            </div>
          )}
          <div className="px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium flex items-center gap-2">
            <Zap size={14} /> AI Ready
          </div>
        </div>
      </motion.div>

      {/* Stats — all from real data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Skill Strength"
          value={`${avgStrength}%`}
          icon={Brain}
          color="violet"
          subtitle={`across ${skills.length} skills`}
          delay={0}
        />
        <StatCard
          title="Learning Progress"
          value={`${avgProgress}%`}
          icon={Map}
          color="blue"
          subtitle={`${activePaths.length} active path${activePaths.length !== 1 ? 's' : ''}`}
          delay={0.05}
        />
        <StatCard
          title="Best Job Match"
          value={`${bestMatch}%`}
          icon={Briefcase}
          color="emerald"
          subtitle={bestMatchJob ? bestMatchJob.company : 'no matches yet'}
          delay={0.1}
        />
        <StatCard
          title="Total Skills"
          value={skills.length}
          icon={Zap}
          color="amber"
          subtitle={`${skills.filter(s => s.is_inferred).length} inferred`}
          delay={0.15}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SkillRadar skills={skills} />
        <div className="lg:col-span-2">
          {/* Real skill history data — no random numbers */}
          <ProgressChart data={skillHistory} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SkillHeatmap skills={skills} />
        </div>
        {/* Real activity log */}
        <RecentActivity activity={activity} />
      </div>
    </div>
  );
}
