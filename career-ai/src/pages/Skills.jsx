import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Sparkles, X, Loader2 } from 'lucide-react';
import { db, invokeLLM } from '../lib/store';
import { getAdjacentSkills, DECAY_RATES } from '../lib/skillGraph';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { SkillBar, strengthColor } from '../components/ui/SkillBar';
import SkillHeatmap from '../components/charts/SkillHeatmap';

const CATEGORIES = ['all', 'programming', 'framework', 'database', 'devops', 'cloud', 'soft_skill', 'data_science', 'other'];

const SOURCE_VARIANT = { resume: 'blue', manual: 'violet', inferred: 'amber', assessment: 'emerald' };

function AddSkillDialog({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', category: 'programming', strength: 70 });
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[hsl(240_10%_7%)] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">Add Skill</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Skill Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
              placeholder="e.g. React, Python, Docker..." />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
              {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Strength: {form.strength}%</label>
            <input type="range" min={10} max={100} value={form.strength} onChange={e => setForm(f => ({ ...f, strength: +e.target.value }))}
              className="w-full accent-violet-500" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={() => form.name && onAdd(form)} className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500">Add Skill</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Skills() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: () => db.skills.list() });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const skill = await db.skills.create({ ...data, freshness: data.strength, decay_rate: DECAY_RATES[data.category] || 0.05, last_used_date: new Date().toISOString(), source: 'manual', is_inferred: false });
      const adjacent = getAdjacentSkills(data.name, data.strength);
      const existing = skills.map(s => s.name.toLowerCase());
      const newAdjacent = adjacent.filter(a => !existing.includes(a.name.toLowerCase()));
      if (newAdjacent.length) await db.skills.bulkCreate(newAdjacent.map(a => ({ ...a, freshness: a.strength, decay_rate: DECAY_RATES['other'] || 0.05, last_used_date: new Date().toISOString() })));
      return skill;
    },
    onSuccess: () => { qc.invalidateQueries(['skills']); qc.invalidateQueries(['activity']); qc.invalidateQueries(['skillHistory']); setShowAdd(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.skills.delete(id),
    onSuccess: () => { qc.invalidateQueries(['skills']); qc.invalidateQueries(['activity']); qc.invalidateQueries(['skillHistory']); },
  });

  const analyzeResume = async () => {
    setAnalyzing(true);
    try {
      const result = await invokeLLM('extract skills from resume');
      const parsed = JSON.parse(result);
      await db.skills.bulkCreate(parsed.map(s => ({ ...s, freshness: s.strength, decay_rate: DECAY_RATES[s.category] || 0.05, last_used_date: new Date().toISOString(), is_inferred: false })));
      qc.invalidateQueries(['skills']);
      qc.invalidateQueries(['activity']);
      qc.invalidateQueries(['skillHistory']);
    } finally { setAnalyzing(false); }
  };

  const filtered = filter === 'all' ? skills : skills.filter(s => s.category === filter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Skills</h2>
          <p className="text-white/40 text-sm">{skills.length} skills tracked</p>
        </div>
        <div className="flex gap-2">
          <button onClick={analyzeResume} disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 disabled:opacity-50">
            {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI Analyze
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500">
            <Plus size={14} /> Add Skill
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === cat ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}>
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Heatmap */}
      <SkillHeatmap skills={filtered} />

      {/* Skill cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((skill, i) => (
            <motion.div key={skill.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4 hover:border-violet-500/30 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-medium text-sm">{skill.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{skill.category.replace('_', ' ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={SOURCE_VARIANT[skill.source] || 'gray'}>{skill.source}</Badge>
                    <button onClick={() => deleteMutation.mutate(skill.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>Strength</span><span>{skill.strength}%</span>
                  </div>
                  <SkillBar value={skill.strength} color={strengthColor(skill.strength)} />
                  <div className="flex justify-between text-xs text-white/40 mb-1 mt-2">
                    <span>Freshness</span><span>{skill.freshness}%</span>
                  </div>
                  <SkillBar value={skill.freshness} color="blue" />
                </div>
                {skill.is_inferred && (
                  <p className="text-xs text-amber-400/70 mt-2 flex items-center gap-1"><Sparkles size={10} /> Inferred from {skill.parent_skill}</p>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showAdd && <AddSkillDialog onClose={() => setShowAdd(false)} onAdd={(data) => addMutation.mutate(data)} />}
    </div>
  );
}
