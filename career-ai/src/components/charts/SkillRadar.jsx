import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../ui/Card';

export default function SkillRadar({ skills }) {
  const categories = ['programming', 'framework', 'database', 'devops', 'cloud', 'soft_skill', 'data_science'];
  const data = categories.map(cat => {
    const catSkills = skills.filter(s => s.category === cat);
    const avg = catSkills.length ? Math.round(catSkills.reduce((a, s) => a + s.strength, 0) / catSkills.length) : 0;
    return { subject: cat.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), value: avg, fullMark: 100 };
  }).filter(d => d.value > 0);

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-white/80 mb-4">Skill Radar</p>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
          <Radar name="Strength" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} strokeWidth={2} />
          <Tooltip
            contentStyle={{ background: 'hsl(240 10% 8%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
            formatter={(v) => [`${v}%`, 'Avg Strength']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
}
