import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Card from '../ui/Card';

export default function ProgressChart({ data = [] }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white/80">Skill Growth Trend</p>
        <div className="flex items-center gap-4 text-xs text-white/40">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Strength</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Freshness</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gStrength" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gFreshness" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'hsl(240 10% 8%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
            formatter={(v, name) => [`${v}%`, name]}
          />
          <Area type="monotone" dataKey="strength" stroke="#7c3aed" fill="url(#gStrength)" strokeWidth={2} name="Strength" dot={{ r: 3, fill: '#7c3aed' }} activeDot={{ r: 5 }} />
          <Area type="monotone" dataKey="freshness" stroke="#10b981" fill="url(#gFreshness)" strokeWidth={2} name="Freshness" dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
