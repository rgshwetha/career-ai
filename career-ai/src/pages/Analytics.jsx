import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { db } from '../lib/store';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { Brain, Map, Briefcase, Database } from 'lucide-react';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const TT_STYLE = { background: 'hsl(240 10% 8%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 };

export default function Analytics() {
  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: () => db.skills.list() });
  const { data: paths = [] } = useQuery({ queryKey: ['paths'], queryFn: () => db.paths.list() });
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: () => db.jobs.list() });
  const { data: memories = [] } = useQuery({ queryKey: ['memories'], queryFn: () => db.memories.list() });

  // By category
  const byCategory = Object.entries(
    skills.reduce((acc, s) => { acc[s.category] = acc[s.category] || []; acc[s.category].push(s.strength); return acc; }, {})
  ).map(([cat, vals]) => ({ name: cat.replace('_', ' '), avg: Math.round(vals.reduce((a, v) => a + v, 0) / vals.length) }));

  // By source
  const bySource = Object.entries(
    skills.reduce((acc, s) => { acc[s.source] = (acc[s.source] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Growth trend
  const trend = Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    strength: Math.min(100, 55 + i * 2.5 + Math.random() * 4),
    freshness: Math.min(100, 60 + i * 1.8 + Math.random() * 3),
  }));

  // Top 5 skills
  const top5 = [...skills].sort((a, b) => b.strength - a.strength).slice(0, 5);

  // Job status
  const jobStatus = Object.entries(
    jobs.reduce((acc, j) => { acc[j.status] = (acc[j.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white">Analytics</h2>
        <p className="text-white/40 text-sm">Your career intelligence at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Skills" value={skills.length} icon={Brain} color="violet" delay={0} />
        <StatCard title="Learning Paths" value={paths.length} icon={Map} color="blue" delay={0.05} />
        <StatCard title="Job Matches" value={jobs.length} icon={Briefcase} color="emerald" delay={0.1} />
        <StatCard title="Memories" value={memories.length} icon={Database} color="amber" delay={0.15} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strength by category */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5">
            <p className="text-sm font-semibold text-white/80 mb-4">Avg Strength by Category</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCategory} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT_STYLE} />
                <Bar dataKey="avg" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Avg Strength" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Source distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5">
            <p className="text-sm font-semibold text-white/80 mb-4">Skill Source Distribution</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bySource} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TT_STYLE} />
                <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Growth trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5">
            <p className="text-sm font-semibold text-white/80 mb-4">8-Week Growth Trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} /><stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT_STYLE} />
                <Area type="monotone" dataKey="strength" stroke="#7c3aed" fill="url(#g1)" strokeWidth={2} name="Strength" />
                <Area type="monotone" dataKey="freshness" stroke="#10b981" fill="url(#g2)" strokeWidth={2} name="Freshness" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Top 5 skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5">
            <p className="text-sm font-semibold text-white/80 mb-4">Top 5 Strongest Skills</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={top5} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={TT_STYLE} />
                <Bar dataKey="strength" radius={[0, 4, 4, 0]} name="Strength">
                  {top5.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Job status pie */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-5">
          <p className="text-sm font-semibold text-white/80 mb-4">Job Match Status</p>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={jobStatus} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={4} label={({ name, value }) => `${name}: ${value}`}>
                  {jobStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TT_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
