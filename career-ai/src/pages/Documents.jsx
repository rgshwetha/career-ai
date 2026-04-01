import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Trash2, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { invokeLLM } from '../lib/store';

const DOC_TYPES = { resume: 'violet', certificate: 'emerald', note: 'blue', transcript: 'amber', portfolio: 'gray' };

export default function Documents() {
  const [docs, setDocs] = useState([
    { id: '1', title: 'Resume_2024.pdf', doc_type: 'resume', status: 'processed', extracted_skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'] },
    { id: '2', title: 'AWS_Certificate.pdf', doc_type: 'certificate', status: 'processed', extracted_skills: ['AWS', 'Cloud Architecture', 'EC2', 'S3'] },
  ]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = async (file) => {
    const id = String(Date.now());
    const newDoc = { id, title: file.name, doc_type: 'resume', status: 'processing', extracted_skills: [] };
    setDocs(d => [...d, newDoc]);
    try {
      const result = await invokeLLM(`extract skills from resume document: ${file.name}`);
      const parsed = JSON.parse(result);
      setDocs(d => d.map(doc => doc.id === id ? { ...doc, status: 'processed', extracted_skills: parsed.map(s => s.name) } : doc));
    } catch {
      setDocs(d => d.map(doc => doc.id === id ? { ...doc, status: 'error' } : doc));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files).forEach(processFile);
  };

  const handleFileInput = (e) => {
    Array.from(e.target.files).forEach(processFile);
  };

  const deleteDoc = (id) => setDocs(d => d.filter(doc => doc.id !== id));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white">Documents</h2>
        <p className="text-white/40 text-sm">Upload resumes, certificates, and portfolios for AI analysis</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-violet-500/50 hover:bg-white/3'}`}
      >
        <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileInput} />
        <motion.div animate={{ scale: dragging ? 1.1 : 1 }} className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Upload size={24} className="text-violet-400" />
          </div>
          <div>
            <p className="text-white font-medium">Drop files here or click to upload</p>
            <p className="text-white/40 text-sm mt-1">PDF, DOC, DOCX, TXT supported</p>
          </div>
        </motion.div>
      </div>

      {/* Documents list */}
      <div className="space-y-3">
        <AnimatePresence>
          {docs.map((doc, i) => (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium text-sm truncate">{doc.title}</p>
                      <Badge variant={DOC_TYPES[doc.doc_type] || 'gray'}>{doc.doc_type}</Badge>
                      {doc.status === 'processing' && <Badge variant="amber"><Loader2 size={10} className="animate-spin mr-1" />Processing</Badge>}
                      {doc.status === 'processed' && <Badge variant="emerald"><CheckCircle size={10} className="mr-1" />Processed</Badge>}
                      {doc.status === 'error' && <Badge variant="red"><AlertCircle size={10} className="mr-1" />Error</Badge>}
                    </div>
                    {doc.extracted_skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.extracted_skills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteDoc(doc.id)} className="text-white/20 hover:text-red-400 transition-colors shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
