import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Sparkles, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { db, invokeLLM } from '../lib/store';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { SkillBar } from '../components/ui/SkillBar';

const DIFF_VARIANT = { easy: 'emerald', medium: 'amber', hard: 'red' };
const STATUS_VARIANT = { active: 'violet', completed: 'emerald', paused: 'gray' };

function PathCard({ path, onToggleStep, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const completed = path.steps.filter(s => s.completed).length;

  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={STATUS_VARIANT[path.status]}>{path.status}</Badge>
              <Badge variant="gray">{path.scaffolding_level} guidance</Badge>
            </div>
            <h3 className="text-white font-semibold">{path.title}</h3>
            <p className="text-white/40 text-xs mt-0.5">Target: {path.target_role}</p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <button onClick={() => onDelete(path.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
            <button onClick={() => setExpanded(e => !e)} className="text-white/40 hover:text-white">
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-white/40">
            <span>{completed}/{path.steps.length} steps</span>
            <span>{path.progress}%</span>
          </div>
          <SkillBar value={path.progress} color="violet" />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/5">
            <div className="p-5 space-y-3">
              {path.steps.map((step) => (
                <div key={step.order} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                  <button onClick={() => onToggleStep(path.id, step.order)} className="mt-0.5 shrink-0">
                    {step.completed
                      ? <CheckCircle2 size={16} className="text-emerald-400" />
                      : <Circle size={16} className="text-white/20" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${step.completed ? 'text-white/40 line-through' : 'text-white'}`}>{step.title}</p>
                      <Badge variant={DIFF_VARIANT[step.difficulty]}>{step.difficulty}</Badge>
                      <Badge variant="gray">{step.duration_hours}h</Badge>
                    </div>
                    {step.resources?.length > 0 && (
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        {step.resources.map(r => (
                          <span key={r} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 cursor-pointer">
                            <ExternalLink size={10} />{r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function LearningPaths() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: paths = [] } = useQuery({ queryKey: ['paths'], queryFn: () => db.paths.list() });
  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: () => db.skills.list() });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.paths.delete(id),
    onSuccess: () => { qc.invalidateQueries(['paths']); qc.invalidateQueries(['activity']); },
  });

  const toggleStep = useMutation({
    mutationFn: async ({ pathId, stepOrder }) => {
      const path = paths.find(p => p.id === pathId);
      const steps = path.steps.map(s => s.order === stepOrder ? { ...s, completed: !s.completed } : s);
      const progress = Math.round((steps.filter(s => s.completed).length / steps.length) * 100);
      await db.paths.update(pathId, { steps, progress });
    },
    onSuccess: () => { qc.invalidateQueries(['paths']); qc.invalidateQueries(['activity']); },
  });

  const generatePath = async () => {
    setGenerating(true);
    try {
      const skillList = skills.map(s => s.name).join(', ');
      const result = await invokeLLM(`Generate a learning path curriculum for skills: ${skillList}`);
      const parsed = JSON.parse(result);
      await db.paths.create(parsed);
      qc.invalidateQueries(['paths']);
      qc.invalidateQueries(['activity']);
    } finally { setGenerating(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Learning Paths</h2>
          <p className="text-white/40 text-sm">{paths.filter(p => p.status === 'active').length} active paths</p>
        </div>
        <button onClick={generatePath} disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-50">
          {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Generate with AI
        </button>
      </div>

      <div className="space-y-4">
        {paths.map(path => (
          <PathCard key={path.id} path={path}
            onToggleStep={(pathId, stepOrder) => toggleStep.mutate({ pathId, stepOrder })}
            onDelete={(id) => deleteMutation.mutate(id)} />
        ))}
      </div>
    </div>
  );
}
