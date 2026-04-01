import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Save, Plus, X, Shield, Cloud, LogOut } from 'lucide-react';
import { db } from '../lib/store';
import Card from '../components/ui/Card';

const PERSONAS = ['student', 'junior', 'senior', 'career_changer', 'freelancer'];

export default function Settings() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => db.profile.get() });
  const [form, setForm] = useState(null);
  const [newIndustry, setNewIndustry] = useState('');
  const [saved, setSaved] = useState(false);

  const data = form || profile || {};

  const saveMutation = useMutation({
    mutationFn: (d) => db.profile.update(d),
    onSuccess: () => { qc.invalidateQueries(['profile']); qc.invalidateQueries(['activity']); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const set = (key, val) => setForm(f => ({ ...(f || profile), [key]: val }));

  const addIndustry = () => {
    if (!newIndustry.trim()) return;
    set('preferred_industries', [...(data.preferred_industries || []), newIndustry.trim()]);
    setNewIndustry('');
  };

  const removeIndustry = (i) => {
    set('preferred_industries', data.preferred_industries.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-white/40 text-sm">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <Card className="p-6 space-y-5">
        <p className="text-sm font-semibold text-white/80">Professional Profile</p>

        <div>
          <label className="text-xs text-white/50 mb-1.5 block">Headline</label>
          <input value={data.headline || ''} onChange={e => set('headline', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Persona</label>
            <select value={data.persona || 'senior'} onChange={e => set('persona', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
              {PERSONAS.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Years Experience</label>
            <input type="number" min={0} max={40} value={data.years_experience || 0} onChange={e => set('years_experience', +e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
          </div>
        </div>

        <div>
          <label className="text-xs text-white/50 mb-1.5 block">Target Role</label>
          <input value={data.target_role || ''} onChange={e => set('target_role', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
        </div>

        {/* Industries */}
        <div>
          <label className="text-xs text-white/50 mb-1.5 block">Preferred Industries</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(data.preferred_industries || []).map((ind, i) => (
              <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/20 text-violet-300 text-xs">
                {ind}
                <button onClick={() => removeIndustry(i)} className="text-violet-400 hover:text-white"><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newIndustry} onChange={e => setNewIndustry(e.target.value)} onKeyDown={e => e.key === 'Enter' && addIndustry()}
              placeholder="Add industry..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
            <button onClick={addIndustry} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-6">
        <p className="text-sm font-semibold text-white/80 mb-4">Privacy & Data</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.privacy_mode === 'cloud' ? <Cloud size={18} className="text-blue-400" /> : <Shield size={18} className="text-emerald-400" />}
            <div>
              <p className="text-sm text-white">{data.privacy_mode === 'cloud' ? 'Cloud Sync' : 'Local Only'}</p>
              <p className="text-xs text-white/40">{data.privacy_mode === 'cloud' ? 'Data synced to cloud' : 'Data stored locally only'}</p>
            </div>
          </div>
          <button onClick={() => set('privacy_mode', data.privacy_mode === 'cloud' ? 'local' : 'cloud')}
            className={`w-11 h-6 rounded-full transition-colors relative ${data.privacy_mode === 'cloud' ? 'bg-violet-600' : 'bg-white/10'}`}>
            <motion.div animate={{ x: data.privacy_mode === 'cloud' ? 22 : 2 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" />
          </button>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => saveMutation.mutate(data)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${saved ? 'bg-emerald-600 text-white' : 'bg-violet-600 text-white hover:bg-violet-500'}`}>
          <Save size={14} />{saved ? 'Saved!' : 'Save Changes'}
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}
