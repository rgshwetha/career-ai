import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Skills from './pages/Skills';
import LearningPaths from './pages/LearningPaths';
import JobMatches from './pages/JobMatches';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';
import Documents from './pages/Documents';
import Settings from './pages/Settings';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30000 } } });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/learning" element={<LearningPaths />} />
            <Route path="/jobs" element={<JobMatches />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
