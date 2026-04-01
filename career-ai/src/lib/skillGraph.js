// Skill decay rates by category
export const DECAY_RATES = {
  programming: 0.05,
  framework: 0.08,
  database: 0.06,
  devops: 0.12,
  design: 0.04,
  soft_skill: 0.02,
  data_science: 0.07,
  cloud: 0.12,
  security: 0.09,
  other: 0.05,
};

// Adjacent skill graph
export const ADJACENT_SKILLS = {
  React: ['Redux', 'Next.js', 'React Testing Library', 'TypeScript'],
  'Node.js': ['REST API', 'Express', 'GraphQL', 'MongoDB'],
  Python: ['NumPy', 'Pandas', 'FastAPI', 'Scikit-learn'],
  PostgreSQL: ['SQL', 'Database Design', 'Redis'],
  Docker: ['Kubernetes', 'CI/CD', 'Terraform'],
  JavaScript: ['TypeScript', 'React', 'Node.js', 'Vue'],
  TypeScript: ['React', 'Node.js', 'Angular'],
  AWS: ['EC2', 'S3', 'Lambda', 'CloudFormation'],
  'Machine Learning': ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn'],
  GraphQL: ['Apollo', 'REST API', 'Node.js'],
};

export function computeDecayedStrength(initialStrength, decayRate, lastUsedDate) {
  if (!lastUsedDate) return initialStrength;
  const days = (Date.now() - new Date(lastUsedDate).getTime()) / (1000 * 60 * 60 * 24);
  return Math.round(initialStrength * Math.exp(-decayRate * days));
}

export function getAdjacentSkills(skillName, strength) {
  const adjacent = ADJACENT_SKILLS[skillName] || [];
  return adjacent.map((name) => ({
    name,
    strength: Math.round(strength * 0.65),
    is_inferred: true,
    parent_skill: skillName,
    source: 'inferred',
  }));
}
