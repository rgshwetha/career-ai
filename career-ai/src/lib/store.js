// Mock in-memory data store (replaces Base44 BaaS)
import { getAdjacentSkills } from './skillGraph';

// Activity log — real timestamped events
let _activity = [
  { id: 'a1', type: 'skill', label: 'Skill added: React', sub: 'Strength 88%', ts: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'a2', type: 'skill', label: 'Skill added: TypeScript', sub: 'Strength 82%', ts: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'a3', type: 'path', label: 'Path started: Senior Frontend Engineer Path', sub: '45% complete', ts: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'a4', type: 'job', label: 'Job match: Senior React Developer @ TechCorp', sub: '92% match', ts: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 'a5', type: 'skill', label: 'Skill updated: Node.js', sub: 'Strength 75%', ts: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 'a6', type: 'path', label: 'Step completed: REST API Design', sub: 'Full Stack Node.js Path', ts: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  { id: 'a7', type: 'job', label: 'Status changed: Full Stack Engineer → Interested', sub: 'StartupXYZ', ts: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

// Weekly skill snapshots — real historical data derived from current skills
function buildSkillHistory(skills) {
  if (!skills.length) return [];
  const now = Date.now();
  const avgStrength = skills.reduce((a, s) => a + s.strength, 0) / skills.length;
  const avgFreshness = skills.reduce((a, s) => a + s.freshness, 0) / skills.length;
  // Simulate 8 weeks of history ending at current values
  return Array.from({ length: 8 }, (_, i) => {
    const weekLabel = i === 7 ? 'Now' : `W${i + 1}`;
    const factor = i / 7;
    return {
      week: weekLabel,
      strength: Math.round((avgStrength * 0.78 + avgStrength * 0.22 * factor)),
      freshness: Math.round((avgFreshness * 0.80 + avgFreshness * 0.20 * factor)),
    };
  });
}

let _skills = [
  { id: '1', name: 'React', category: 'framework', strength: 88, freshness: 90, decay_rate: 0.08, last_used_date: new Date().toISOString(), source: 'resume', is_inferred: false },
  { id: '2', name: 'TypeScript', category: 'programming', strength: 82, freshness: 85, decay_rate: 0.05, last_used_date: new Date().toISOString(), source: 'resume', is_inferred: false },
  { id: '3', name: 'Node.js', category: 'framework', strength: 75, freshness: 78, decay_rate: 0.08, last_used_date: new Date().toISOString(), source: 'resume', is_inferred: false },
  { id: '4', name: 'Python', category: 'programming', strength: 70, freshness: 65, decay_rate: 0.05, last_used_date: new Date().toISOString(), source: 'manual', is_inferred: false },
  { id: '5', name: 'PostgreSQL', category: 'database', strength: 65, freshness: 70, decay_rate: 0.06, last_used_date: new Date().toISOString(), source: 'resume', is_inferred: false },
  { id: '6', name: 'Docker', category: 'devops', strength: 60, freshness: 55, decay_rate: 0.12, last_used_date: new Date().toISOString(), source: 'manual', is_inferred: false },
  { id: '7', name: 'Redux', category: 'framework', strength: 57, freshness: 60, decay_rate: 0.08, last_used_date: new Date().toISOString(), source: 'inferred', is_inferred: true },
  { id: '8', name: 'AWS', category: 'cloud', strength: 50, freshness: 45, decay_rate: 0.12, last_used_date: new Date().toISOString(), source: 'manual', is_inferred: false },
  { id: '9', name: 'GraphQL', category: 'other', strength: 45, freshness: 50, decay_rate: 0.05, last_used_date: new Date().toISOString(), source: 'inferred', is_inferred: true },
  { id: '10', name: 'Communication', category: 'soft_skill', strength: 80, freshness: 95, decay_rate: 0.02, last_used_date: new Date().toISOString(), source: 'manual', is_inferred: false },
];

let _paths = [
  {
    id: '1', title: 'Senior Frontend Engineer Path', target_role: 'Senior Frontend Engineer',
    status: 'active', progress: 45, scaffolding_level: 'hints',
    steps: [
      { title: 'Advanced React Patterns', skill: 'React', difficulty: 'hard', duration_hours: 20, completed: true, order: 1, resources: ['React Docs', 'Kent C. Dodds Blog'] },
      { title: 'TypeScript Deep Dive', skill: 'TypeScript', difficulty: 'medium', duration_hours: 15, completed: true, order: 2, resources: ['TypeScript Handbook'] },
      { title: 'Performance Optimization', skill: 'React', difficulty: 'hard', duration_hours: 12, completed: false, order: 3, resources: ['web.dev', 'Chrome DevTools'] },
      { title: 'Testing Strategies', skill: 'React Testing Library', difficulty: 'medium', duration_hours: 10, completed: false, order: 4, resources: ['Testing Library Docs'] },
    ],
  },
  {
    id: '2', title: 'Full Stack Node.js Path', target_role: 'Full Stack Developer',
    status: 'active', progress: 20, scaffolding_level: 'full',
    steps: [
      { title: 'REST API Design', skill: 'Node.js', difficulty: 'medium', duration_hours: 8, completed: true, order: 1, resources: ['REST API Tutorial'] },
      { title: 'Database Optimization', skill: 'PostgreSQL', difficulty: 'hard', duration_hours: 14, completed: false, order: 2, resources: ['PostgreSQL Docs'] },
      { title: 'Docker & Containers', skill: 'Docker', difficulty: 'medium', duration_hours: 10, completed: false, order: 3, resources: ['Docker Docs'] },
    ],
  },
];

let _jobs = [
  {
    id: '1', title: 'Senior React Developer', company: 'TechCorp', match_score: 92, readiness_score: 85,
    required_skills: ['React', 'TypeScript', 'Node.js'], matched_skills: ['React', 'TypeScript', 'Node.js'],
    missing_skills: ['Next.js'], improvement_suggestions: ['Learn Next.js SSR patterns'],
    salary_range: '$130k–$160k', location: 'Remote', remote: true, status: 'suggested',
    description: 'Build scalable frontend applications with React and TypeScript.',
  },
  {
    id: '2', title: 'Full Stack Engineer', company: 'StartupXYZ', match_score: 78, readiness_score: 70,
    required_skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'], matched_skills: ['React', 'Node.js', 'PostgreSQL'],
    missing_skills: ['Docker', 'Kubernetes'], improvement_suggestions: ['Get Docker certified', 'Practice Kubernetes basics'],
    salary_range: '$110k–$140k', location: 'San Francisco, CA', remote: false, status: 'interested',
    description: 'End-to-end product development across the full stack.',
  },
  {
    id: '3', title: 'ML Engineer', company: 'AI Labs', match_score: 55, readiness_score: 45,
    required_skills: ['Python', 'TensorFlow', 'AWS', 'Docker'], matched_skills: ['Python', 'AWS'],
    missing_skills: ['TensorFlow', 'PyTorch', 'MLOps'], improvement_suggestions: ['Complete ML specialization', 'Build portfolio projects'],
    salary_range: '$150k–$200k', location: 'New York, NY', remote: true, status: 'suggested',
    description: 'Design and deploy machine learning models at scale.',
  },
];

let _memories = [
  { id: '1', type: 'semantic', content: 'User prefers React over Vue for frontend work', importance: 0.8, strength: 0.9, sentiment: 'positive' },
  { id: '2', type: 'episodic', content: 'Completed TypeScript deep dive course', importance: 0.7, strength: 0.85, sentiment: 'motivated' },
  { id: '3', type: 'procedural', content: 'Prefers learning through hands-on projects', importance: 0.9, strength: 0.95, sentiment: 'positive' },
];

let _profile = {
  headline: 'Full Stack Developer | React & Node.js Specialist',
  persona: 'senior',
  target_role: 'Senior Frontend Engineer',
  years_experience: 5,
  preferred_industries: ['Technology', 'FinTech', 'SaaS'],
  privacy_mode: 'cloud',
  onboarding_complete: true,
  name: 'Alex Johnson',
  email: 'alex@example.com',
};

let _nextId = 100;
const genId = () => String(++_nextId);
const logActivity = (type, label, sub) => {
  _activity.unshift({ id: genId(), type, label, sub, ts: new Date().toISOString() });
  if (_activity.length > 50) _activity.pop();
};

export const db = {
  skills: {
    list: () => Promise.resolve([..._skills]),
    create: (data) => {
      const s = { id: genId(), ...data };
      _skills.push(s);
      logActivity('skill', `Skill added: ${s.name}`, `Strength ${s.strength}%`);
      return Promise.resolve(s);
    },
    update: (id, data) => {
      _skills = _skills.map(s => s.id === id ? { ...s, ...data } : s);
      const s = _skills.find(s => s.id === id);
      if (s) logActivity('skill', `Skill updated: ${s.name}`, `Strength ${s.strength}%`);
      return Promise.resolve();
    },
    delete: (id) => {
      const s = _skills.find(s => s.id === id);
      if (s) logActivity('skill', `Skill removed: ${s.name}`, '');
      _skills = _skills.filter(s => s.id !== id);
      return Promise.resolve();
    },
    bulkCreate: (items) => {
      const created = items.map(d => { const s = { id: genId(), ...d }; _skills.push(s); return s; });
      if (created.length) logActivity('skill', `${created.length} skills added from analysis`, created.map(s => s.name).slice(0, 3).join(', '));
      return Promise.resolve(created);
    },
  },
  paths: {
    list: () => Promise.resolve([..._paths]),
    create: (data) => {
      const p = { id: genId(), ...data };
      _paths.push(p);
      logActivity('path', `Path created: ${p.title}`, p.target_role);
      return Promise.resolve(p);
    },
    update: (id, data) => {
      _paths = _paths.map(p => p.id === id ? { ...p, ...data } : p);
      const p = _paths.find(p => p.id === id);
      if (p && data.progress !== undefined) logActivity('path', `Path progress: ${p.title}`, `${p.progress}% complete`);
      return Promise.resolve();
    },
    delete: (id) => { _paths = _paths.filter(p => p.id !== id); return Promise.resolve(); },
  },
  jobs: {
    list: () => Promise.resolve([..._jobs]),
    create: (data) => {
      const j = { id: genId(), ...data };
      _jobs.push(j);
      logActivity('job', `Job match: ${j.title} @ ${j.company}`, `${j.match_score}% match`);
      return Promise.resolve(j);
    },
    update: (id, data) => {
      const prev = _jobs.find(j => j.id === id);
      _jobs = _jobs.map(j => j.id === id ? { ...j, ...data } : j);
      const j = _jobs.find(j => j.id === id);
      if (j && data.status && prev?.status !== data.status) logActivity('job', `${j.title} → ${data.status}`, j.company);
      return Promise.resolve();
    },
    delete: (id) => { _jobs = _jobs.filter(j => j.id !== id); return Promise.resolve(); },
    bulkCreate: (items) => {
      const created = items.map(d => { const j = { id: genId(), ...d }; _jobs.push(j); return j; });
      if (created.length) logActivity('job', `${created.length} new job matches generated`, '');
      return Promise.resolve(created);
    },
  },
  memories: {
    list: () => Promise.resolve([..._memories]),
    create: (data) => { const m = { id: genId(), ...data }; _memories.push(m); return Promise.resolve(m); },
  },
  profile: {
    get: () => Promise.resolve({ ..._profile }),
    update: (data) => {
      _profile = { ..._profile, ...data };
      logActivity('profile', 'Profile updated', _profile.headline);
      return Promise.resolve({ ..._profile });
    },
  },
  activity: {
    list: () => Promise.resolve([..._activity]),
  },
  skillHistory: {
    get: () => Promise.resolve(buildSkillHistory(_skills)),
  },
};

// Simulated AI responses
export async function invokeLLM(prompt, context = '') {
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

  if (prompt.includes('job match') || prompt.includes('job opportunities')) {
    return JSON.stringify([
      { title: 'Staff Engineer', company: 'Stripe', match_score: 89, readiness_score: 80, required_skills: ['React', 'TypeScript', 'Node.js', 'System Design'], matched_skills: ['React', 'TypeScript', 'Node.js'], missing_skills: ['System Design'], improvement_suggestions: ['Study distributed systems', 'Practice system design interviews'], salary_range: '$180k–$240k', location: 'Remote', remote: true, status: 'suggested', description: 'Lead technical direction for payment infrastructure.' },
      { title: 'Frontend Architect', company: 'Vercel', match_score: 84, readiness_score: 75, required_skills: ['React', 'Next.js', 'TypeScript', 'Performance'], matched_skills: ['React', 'TypeScript'], missing_skills: ['Next.js', 'Edge Computing'], improvement_suggestions: ['Build Next.js projects', 'Learn edge functions'], salary_range: '$160k–$200k', location: 'Remote', remote: true, status: 'suggested', description: 'Shape the future of frontend development tooling.' },
    ]);
  }

  if (prompt.includes('learning path') || prompt.includes('curriculum')) {
    return JSON.stringify({
      title: 'AI-Generated Learning Path',
      target_role: 'Senior Engineer',
      status: 'active',
      progress: 0,
      scaffolding_level: 'hints',
      steps: [
        { title: 'System Design Fundamentals', skill: 'System Design', difficulty: 'hard', duration_hours: 20, completed: false, order: 1, resources: ['Designing Data-Intensive Applications', 'System Design Primer'] },
        { title: 'Advanced TypeScript', skill: 'TypeScript', difficulty: 'medium', duration_hours: 12, completed: false, order: 2, resources: ['TypeScript Deep Dive', 'Matt Pocock courses'] },
        { title: 'Cloud Architecture on AWS', skill: 'AWS', difficulty: 'hard', duration_hours: 25, completed: false, order: 3, resources: ['AWS Well-Architected Framework', 'A Cloud Guru'] },
      ],
    });
  }

  if (prompt.includes('resume') || prompt.includes('extract skills')) {
    return JSON.stringify([
      { name: 'React', category: 'framework', strength: 85, source: 'resume' },
      { name: 'TypeScript', category: 'programming', strength: 80, source: 'resume' },
      { name: 'Node.js', category: 'framework', strength: 72, source: 'resume' },
      { name: 'CSS', category: 'other', strength: 78, source: 'resume' },
      { name: 'Git', category: 'devops', strength: 88, source: 'resume' },
    ]);
  }

  // Chat response
  const responses = [
    "Based on your skill profile, I'd recommend focusing on **System Design** next — it's the most common gap for senior-level roles. Your React and TypeScript scores are strong, so you're well-positioned for frontend-heavy positions.\n\nWant me to generate a targeted learning path for this?",
    "Looking at your job matches, the **Staff Engineer at Stripe** aligns well with your trajectory. The main gap is System Design knowledge. I'd estimate 6–8 weeks of focused study to close that gap.\n\nYour Python skills could also open doors to ML-adjacent roles if you're interested in that direction.",
    "Your skill decay analysis shows **Docker** and **AWS** are losing freshness fastest. Consider a small project using both — even a simple containerized app deployed to AWS would refresh both skills simultaneously.",
    "I've analyzed your learning patterns. You tend to learn best through **hands-on projects** rather than passive reading. I'd suggest building a real project for each skill you want to strengthen rather than just following tutorials.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
