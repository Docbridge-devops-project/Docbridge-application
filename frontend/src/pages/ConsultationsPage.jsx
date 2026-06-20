import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { consultationApi } from '../api/consultationApi';
import { formatDate } from '../utils/formatters';

export default function ConsultationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    doctorName: '',
    doctorSpecialty: '',
    hospitalClinic: '',
    consultationDate: '',
    diagnosis: '',
    doctorNotes: '',
    followUpDate: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [explainingId, setExplainingId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    consultationApi.list({ search, page: 1, limit: 100 })
      .then(res => {
        setItems(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Failed to load consultations:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        followUpDate: form.followUpDate || null,
        status: 'completed'
      };
      
      const res = await consultationApi.create(payload);
      if (res.data?.success) {
        setShowCreate(false);
        setForm({
          doctorName: '',
          doctorSpecialty: '',
          hospitalClinic: '',
          consultationDate: '',
          diagnosis: '',
          doctorNotes: '',
          followUpDate: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to create consultation';
      const details = err.response?.data?.errors?.map(e => e.message).join(', ');
      setFormError(details ? `${msg}: ${details}` : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiExplain = async (id) => {
    setExplainingId(id);
    try {
      const res = await consultationApi.aiExplain(id);
      if (res.data?.success) {
        // Update the item in the list with simplified explanation
        setItems(prev => prev.map(item => 
          item.id === id 
            ? { ...item, diagnosis_simplified: res.data.data.diagnosisSimplified } 
            : item
        ));
      }
    } catch (err) {
      console.error("AI explanation failed:", err);
      alert("Failed to generate AI explanation. Please check OpenAi configuration.");
    } finally {
      setExplainingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this consultation record?')) return;
    try {
      await consultationApi.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete consultation:", err);
      alert("Failed to delete consultation.");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Consultations
          </h1>
          <p className="text-slate-400 text-sm mt-1">Keep track of your doctor visits and health advice</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
          + Add Consultation
        </Button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search by doctor, specialty, diagnosis..."
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
          icon="🩺" 
          title="No consultations found" 
          description={search ? "Try adjusting your search query." : "Log your first consultation to track your doctor visits and get AI-powered insights."} 
          action={!search && <Button onClick={() => setShowCreate(true)}>Add Consultation</Button>} 
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
                {/* Header/Collapsible trigger */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-slate-100">{item.doctor_name || 'Doctor visit'}</h3>
                      <StatusBadge status={item.status || 'completed'} />
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      <span className="text-teal-400 font-medium">{item.doctor_specialty || 'General Practitioner'}</span>
                      {item.hospital_clinic && <span className="text-slate-500"> • {item.hospital_clinic}</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Visit Date: {formatDate(item.consultation_date)}</p>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-500 hover:text-red-400 text-xs transition-colors p-2"
                      title="Delete record"
                    >
                      🗑️
                    </button>
                    <span className="text-xs text-slate-400">
                      {isExpanded ? 'Click to collapse ▴' : 'Click to expand ▾'}
                    </span>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-6 bg-slate-950/40 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Original Diagnosis</h4>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.diagnosis || 'No diagnosis logged.'}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Doctor Notes / Instructions</h4>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.doctor_notes || 'No notes logged.'}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {item.follow_up_date && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Follow-up Date</h4>
                          <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 text-teal-300 text-sm">
                            📅 {formatDate(item.follow_up_date)}
                            {item.follow_up_notes && <p className="mt-2 text-slate-400 text-xs">{item.follow_up_notes}</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Simplified Diagnosis Section */}
                    <div className="bg-gradient-to-br from-teal-950/30 to-cyan-950/30 border border-teal-500/20 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🤖</span>
                          <h4 className="text-sm font-semibold text-teal-400">DocBridge AI simplified diagnosis</h4>
                        </div>
                        {!item.diagnosis_simplified && !explainingId && (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleAiExplain(item.id); }}
                            className="py-1 px-3 text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30"
                          >
                            Explain Diagnosis
                          </Button>
                        )}
                      </div>

                      {explainingId === item.id ? (
                        <div className="flex items-center gap-3 text-sm text-slate-400 py-2">
                          <LoadingSpinner size="sm" />
                          <span>AI is translating medical jargon into plain language...</span>
                        </div>
                      ) : item.diagnosis_simplified ? (
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {item.diagnosis_simplified}
                        </p>
                      ) : (
                        <p className="text-slate-500 text-xs italic">
                          Click "Explain Diagnosis" to get a plain-language explanation of this consultation's diagnosis.
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

      {/* Add New Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Log Consultation Visit">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Doctor Name" 
              name="doctorName" 
              value={form.doctorName} 
              onChange={handleInputChange} 
              placeholder="e.g. Dr. Sarah Connor" 
              required 
            />
            <Input 
              label="Specialty" 
              name="doctorSpecialty" 
              value={form.doctorSpecialty} 
              onChange={handleInputChange} 
              placeholder="e.g. Cardiologist" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Hospital / Clinic" 
              name="hospitalClinic" 
              value={form.hospitalClinic} 
              onChange={handleInputChange} 
              placeholder="e.g. City General Hospital" 
              required 
            />
            <Input 
              label="Visit Date" 
              type="date" 
              name="consultationDate" 
              value={form.consultationDate} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Diagnosis / Medical Jargon</label>
            <textarea
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter the official diagnosis as written in your medical records..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Doctor Notes & Instructions</label>
            <textarea
              name="doctorNotes"
              value={form.doctorNotes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter prescription instructions, dietary advice, or notes..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
            />
          </div>

          <Input 
            label="Follow-up Visit Date (Optional)" 
            type="date" 
            name="followUpDate" 
            value={form.followUpDate} 
            onChange={handleInputChange} 
          />

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              Save Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
