import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { symptomApi } from '../api/symptomApi';
import { formatDate } from '../utils/formatters';

export default function SymptomsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    symptomName: '',
    severity: 5,
    onsetDate: '',
    bodyLocation: '',
    triggers: '',
    relievedBy: '',
    notes: '',
    isOngoing: true,
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [explainingId, setExplainingId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    symptomApi.list({ search, page: 1, limit: 100 })
      .then(res => {
        setItems(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Failed to load symptoms:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : name === 'severity' ? parseInt(value, 10) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        severity: parseInt(form.severity, 10),
      };

      const res = await symptomApi.create(payload);
      if (res.data?.success) {
        const newSymptom = res.data.data;
        setShowCreate(false);
        setForm({
          symptomName: '',
          severity: 5,
          onsetDate: '',
          bodyLocation: '',
          triggers: '',
          relievedBy: '',
          notes: '',
          isOngoing: true,
        });

        // Expand the newly logged symptom
        setExpandedId(newSymptom.id);

        // Automatically fetch AI Assessment
        setExplainingId(newSymptom.id);
        try {
          await symptomApi.aiInsight(newSymptom.id);
        } catch (aiErr) {
          console.error("Auto AI insight failed:", aiErr);
        } finally {
          setExplainingId(null);
        }

        fetchData();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to log symptom';
      const details = err.response?.data?.errors?.map(e => e.message).join(', ');
      setFormError(details ? `${msg}: ${details}` : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiInsight = async (id) => {
    setExplainingId(id);
    try {
      await symptomApi.aiInsight(id);
      fetchData(); // Refresh list to get updated ai_insight field
    } catch (err) {
      console.error("AI insight failed:", err);
      alert("Failed to generate AI insight. Please check OpenAI configuration.");
    } finally {
      setExplainingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this symptom log?')) return;
    try {
      await symptomApi.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete symptom:", err);
      alert("Failed to delete symptom.");
    }
  };

  const getSeverityColor = (sev) => {
    if (sev <= 3) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (sev <= 7) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Symptom Diary
          </h1>
          <p className="text-slate-400 text-sm mt-1">Log symptoms, detect patterns, and receive instant AI clinical assessments</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
          + Log Symptom
        </Button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search by symptom name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300">
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="min-h-[40vh]" />
      ) : items.length === 0 ? (
        <EmptyState 
          icon="📋" 
          title="No logged symptoms" 
          description={search ? "Try adjusting your search query." : "Keep a diary of your physical symptoms to identify triggers and health anomalies."} 
          action={!search && <Button onClick={() => setShowCreate(true)}>Log Your First Symptom</Button>} 
        />
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <div 
                key={item.id} 
                className="bg-white/5 border border-white/5 rounded-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Header Collapsible trigger */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-slate-100">{item.symptom_name}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${getSeverityColor(item.severity)}`}>
                        Severity: {item.severity}/10
                      </span>
                      <StatusBadge status={item.is_ongoing ? 'ongoing' : 'resolved'} />
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      <span className="text-teal-400 font-medium">📍 {item.body_location || 'General'}</span>
                      {item.triggers && <span className="text-slate-500"> • Triggers: {item.triggers}</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Onset Date: {formatDate(item.onset_date)}</p>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-500 hover:text-red-400 text-xs transition-colors p-2"
                      title="Delete log"
                    >
                      🗑️
                    </button>
                    <span className="text-xs text-slate-400">
                      {isExpanded ? 'Collapse ▴' : 'Expand ▾'}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-6 bg-slate-950/40 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Triggers & Relief</h4>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-slate-300 text-sm space-y-2">
                          <p><span className="text-slate-500 font-medium">Triggers:</span> {item.triggers || 'None reported'}</p>
                          <p><span className="text-slate-500 font-medium">Relieved By:</span> {item.relieved_by || 'None reported'}</p>
                          <p><span className="text-slate-500 font-medium">Ongoing Status:</span> {item.is_ongoing ? 'Ongoing' : `Resolved on ${formatDate(item.resolved_date)}`}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Diary Notes</h4>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.notes || 'No description logged.'}
                        </div>
                      </div>
                    </div>

                    {/* AI Assessment Box */}
                    <div className="bg-gradient-to-br from-teal-950/30 to-cyan-950/30 border border-teal-500/20 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🤖</span>
                          <h4 className="text-sm font-semibold text-teal-400">DocBridge AI symptom assessment</h4>
                        </div>
                        {!item.ai_insight && !explainingId && (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleAiInsight(item.id); }}
                            className="py-1 px-3 text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30"
                          >
                            Assess Symptom
                          </Button>
                        )}
                      </div>

                      {explainingId === item.id ? (
                        <div className="flex items-center gap-3 text-sm text-slate-400 py-2">
                          <LoadingSpinner size="sm" />
                          <span>AI is evaluating symptom clusters and cross-referencing clinical indicators...</span>
                        </div>
                      ) : item.ai_insight ? (
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.ai_insight}
                        </p>
                      ) : (
                        <p className="text-slate-500 text-xs italic">
                          Click "Assess Symptom" to receive a safety assessment and clinical questions for your doctor.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Log Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Log New Symptom">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Symptom Name" 
              name="symptomName" 
              value={form.symptomName} 
              onChange={handleInputChange} 
              placeholder="e.g. Headache, Dry Cough" 
              required 
            />
            <Input 
              label="Body Location / Region" 
              name="bodyLocation" 
              value={form.bodyLocation} 
              onChange={handleInputChange} 
              placeholder="e.g. Forehead, Chest" 
              required 
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-300">Severity Level: {form.severity}/10</label>
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                form.severity <= 3 ? 'text-emerald-400 bg-emerald-500/10' : form.severity <= 7 ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
              }`}>
                {form.severity <= 3 ? 'Mild' : form.severity <= 7 ? 'Moderate' : 'Severe'}
              </span>
            </div>
            <input 
              type="range" 
              name="severity" 
              min="1" 
              max="10" 
              value={form.severity} 
              onChange={handleInputChange}
              className="w-full accent-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Onset Date" 
              type="date" 
              name="onsetDate" 
              value={form.onsetDate} 
              onChange={handleInputChange} 
              required 
            />
            <div className="flex items-center pt-6 pl-4 h-full">
              <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  name="isOngoing" 
                  checked={form.isOngoing} 
                  onChange={handleInputChange}
                  className="rounded bg-slate-900 border-white/10 text-teal-500 focus:ring-teal-500/50 w-4 h-4"
                />
                Symptom is ongoing
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Triggers (What makes it worse?)" 
              name="triggers" 
              value={form.triggers} 
              onChange={handleInputChange} 
              placeholder="e.g. Bright lights, cold food" 
            />
            <Input 
              label="Relieved By (What makes it better?)" 
              name="relievedBy" 
              value={form.relievedBy} 
              onChange={handleInputChange} 
              placeholder="e.g. Sleep, lying down" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Diary Description / Additional Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe what the pain feels like, timing, or how it is affecting your day..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              Save & Analyze
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
