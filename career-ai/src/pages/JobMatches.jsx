import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, MapPin, DollarSign, Wifi, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { db, invokeLLM } from '../lib/store';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { SkillBar } from '../components/ui/SkillBar';

const STATUS_ACTIONS = {
  suggested: ['interested', 'dismiss'],
  interested: ['applied', 'dismiss'],
  applied: [],
  dismissed: [],
};

const STATUS_VARIANT = { suggested: 'gray', interested: 'violet', applied: 'emerald', dismissed: 'red' };

function ScoreRing({ value, size = 64, color = '#7c3aed' }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: 13, fontWeight: 'bold', color: 'white' }}>{value}%</span>
      </div>
    </div>
  );
}

function JobCard({ job, onStatusChange }) {
  const actions = STATUS_ACTIONS[job.status] || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-5 hover:border-violet-500/20 transition-colors">
        <div className="flex items-start gap-4">
          <ScoreRing value={job.match_score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-white font-semibold">{job.title}</h3>
                <p className="text-white/50 text-sm">{job.company}</p>
              </div>
              <Badge variant={STATUS_VARIANT[job.status]}>{job.status}</Badge>
            </div>
            <p className="text-white/40 text-xs mt-2 line-clamp-2">{job.description}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {job.salary_range && <span className="flex items-center gap-1 text-xs text-emerald-400"><DollarSign size={11} />{job.salary_range}</span>}
              {job.location && <span className="flex items-center gap-1 text-xs text-white/40"><MapPin size={11} />{job.location}</span>}
              {job.remote && <span className="flex items-center gap-1 text-xs text-blue-400"><Wifi size={11} />Remote</span>}
            </div>
          </div>
        </div>

        {/* Readiness */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-white/40">
            <span>Readiness</span><span>{job.readiness_score}%</span>
          </div>
          <SkillBar value={job.readiness_score} color="emerald" />
        </div>

        {/* Skills */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-white/40 mb-1.5 flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" /> Matched</p>
            <div className="flex flex-wrap gap-1">
              {job.matched_skills?.map(s => <Badge key={s} variant="emerald">{s}</Badge>)}
            </div>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1.5 flex items-center gap-1"><XCircle size={10} className="text-red-400" /> Missing</p>
            <div className="flex flex-wrap gap-1">
              {job.missing_skills?.map(s => <Badge key={s} variant="red">{s}</Badge>)}
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {job.improvement_suggestions?.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs text-amber-400 mb-1 flex items-center gap-1"><AlertCircle size={10} /> Suggestions</p>
            {job.improvement_suggestions.map(s => <p key={s} className="text-xs text-white/50">• {s}</p>)}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex gap-2 mt-4">
            {actions.map(action => (
              <button key={action} onClick={() => onStatusChange(job.id, action === 'dismiss' ? 'dismissed' : action)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${action === 'dismiss' ? 'bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-400' : 'bg-violet-600/20 text-violet-300 hover:bg-violet-600/30'}`}>
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </button>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default function JobMatches() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: () => db.jobs.list() });
  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: () => db.skills.list() });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => db.jobs.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['jobs']); qc.invalidateQueries(['activity']); },
  });

  const generateMatches = async () => {
    setGenerating(true);
    try {
      const skillList = skills.map(s => `${s.name}(${s.strength}%)`).join(', ');
      const result = await invokeLLM(`Find job match opportunities for skills: ${skillList}`);
      const parsed = JSON.parse(result);
      await db.jobs.bulkCreate(parsed);
      qc.invalidateQueries(['jobs']);
      qc.invalidateQueries(['activity']);
    } finally { setGenerating(false); }
  };

  const active = jobs.filter(j => j.status !== 'dismissed');
  const dismissed = jobs.filter(j => j.status === 'dismissed');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Job Matches</h2>
          <p className="text-white/40 text-sm">{active.length} active opportunities</p>
        </div>
        <button onClick={generateMatches} disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-50">
          {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Generate Matches
        </button>
      </div>

      <div className="space-y-4">
        {active.map(job => (
          <JobCard key={job.id} job={job} onStatusChange={(id, status) => statusMutation.mutate({ id, status })} />
        ))}
      </div>

      {dismissed.length > 0 && (
        <div>
          <p className="text-xs text-white/30 mb-3">Dismissed ({dismissed.length})</p>
          <div className="space-y-3 opacity-40">
            {dismissed.map(job => <JobCard key={job.id} job={job} onStatusChange={() => {}} />)}
          </div>
        </div>
      )}
    </div>
  );
}
