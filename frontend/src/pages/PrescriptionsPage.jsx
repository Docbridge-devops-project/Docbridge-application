import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { prescriptionApi } from '../api/prescriptionApi';
import { formatDate } from '../utils/formatters';

export default function PrescriptionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [expandedId, setExpandedId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: '',
    durationDays: '',
    instructions: '',
    startDate: '',
    prescribingDoctor: '',
    purpose: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [explainingId, setExplainingId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    prescriptionApi.list({ search, page: 1, limit: 100 })
      .then(res => {
        setItems(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Failed to load prescriptions:", err);
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
        durationDays: form.durationDays ? parseInt(form.durationDays, 10) : null,
        isActive: true,
      };

      const res = await prescriptionApi.create(payload);
      if (res.data?.success) {
        setShowCreate(false);
        setForm({
          medicineName: '',
          dosage: '',
          frequency: '',
          durationDays: '',
          instructions: '',
          startDate: '',
          prescribingDoctor: '',
          purpose: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to create prescription';
      const details = err.response?.data?.errors?.map(e => e.message).join(', ');
      setFormError(details ? `${msg}: ${details}` : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const newStatus = !item.is_active;
      const res = await prescriptionApi.update(item.id, { isActive: newStatus });
      if (res.data?.success) {
        setItems(prev => prev.map(p => 
          p.id === item.id 
            ? { ...p, is_active: newStatus } 
            : p
        ));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      alert("Failed to update prescription status.");
    }
  };

  const handleAiExplain = async (id) => {
    setExplainingId(id);
    try {
      const res = await prescriptionApi.aiExplain(id);
      if (res.data?.success) {
        setItems(prev => prev.map(item => 
          item.id === id 
            ? { ...item, purpose_simplified: res.data.data.purposeSimplified } 
            : item
        ));
      }
    } catch (err) {
      console.error("AI explanation failed:", err);
      alert("Failed to generate AI explanation. Please check OpenAI configuration.");
    } finally {
      setExplainingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // Filter items based on activeTab
  const filteredItems = items.filter(item => {
    if (activeTab === 'active') {
      return item.is_active === true;
    } else {
      return item.is_active === false;
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Prescriptions
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track your active medicines and history</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
          + Add Medicine
        </Button>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'active' 
              ? 'border-teal-400 text-teal-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Medications ({items.filter(i => i.is_active).length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'history' 
              ? 'border-teal-400 text-teal-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Medication History ({items.filter(i => !i.is_active).length})
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search medicines, doctor, purpose..."
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
      ) : filteredItems.length === 0 ? (
        <EmptyState 
          icon="💊" 
          title={activeTab === 'active' ? "No active medications" : "No medication history"} 
          description={search ? "Try adjusting your search query." : (activeTab === 'active' ? "Add a new prescription to start tracking." : "Completed or stopped medications will appear here.")} 
          action={!search && activeTab === 'active' && <Button onClick={() => setShowCreate(true)}>Add Medicine</Button>} 
        />
      ) : (
        <div className="space-y-4">
          {filteredItems.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <div 
                key={item.id} 
                className="bg-white/5 border border-white/5 rounded-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Header card click */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-slate-100">{item.medicine_name}</h3>
                      <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full">
                        {item.dosage}
                      </span>
                      <StatusBadge status={item.is_active ? 'active' : 'completed'} />
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      <span className="text-teal-400 font-medium">🔁 {item.frequency}</span>
                      {item.duration_days && <span className="text-slate-500"> • {item.duration_days} days</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Started: {formatDate(item.start_date)}</p>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <Button 
                      onClick={() => handleToggleActive(item)}
                      variant={item.is_active ? 'secondary' : 'primary'}
                      className="py-1.5 px-3 text-xs"
                    >
                      {item.is_active ? 'Mark Finished' : 'Re-activate'}
                    </Button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-6 bg-slate-950/40 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Instructions</h4>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.instructions || 'Take as directed by doctor.'}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Details</h4>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-slate-300 text-sm space-y-2">
                          <p><span className="text-slate-500">Prescribing Doctor:</span> Dr. {item.prescribing_doctor || 'Unknown'}</p>
                          <p><span className="text-slate-500">Start Date:</span> {formatDate(item.start_date)}</p>
                          <p><span className="text-slate-500">Duration:</span> {item.duration_days ? `${item.duration_days} Days` : 'Continuous'}</p>
                          {item.purpose && <p><span className="text-slate-500">Indication:</span> {item.purpose}</p>}
                        </div>
                      </div>
                    </div>

                    {/* AI Simplified Indication */}
                    <div className="bg-gradient-to-br from-teal-950/30 to-cyan-950/30 border border-teal-500/20 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🤖</span>
                          <h4 className="text-sm font-semibold text-teal-400">DocBridge AI medicine explainer</h4>
                        </div>
                        {!item.purpose_simplified && !explainingId && (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleAiExplain(item.id); }}
                            className="py-1 px-3 text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30"
                          >
                            Explain Medicine
                          </Button>
                        )}
                      </div>

                      {explainingId === item.id ? (
                        <div className="flex items-center gap-3 text-sm text-slate-400 py-2">
                          <LoadingSpinner size="sm" />
                          <span>AI is generating clinical guidance & safety advice...</span>
                        </div>
                      ) : item.purpose_simplified ? (
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {item.purpose_simplified}
                        </p>
                      ) : (
                        <p className="text-slate-500 text-xs italic">
                          Click "Explain Medicine" to understand why you take this and what food/drug side effects to watch out for.
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

      {/* Add Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Prescription Medicine">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Medicine Name" 
              name="medicineName" 
              value={form.medicineName} 
              onChange={handleInputChange} 
              placeholder="e.g. Lipitor, Metformin" 
              required 
            />
            <Input 
              label="Dosage" 
              name="dosage" 
              value={form.dosage} 
              onChange={handleInputChange} 
              placeholder="e.g. 10mg, 1 tablet" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Frequency" 
              name="frequency" 
              value={form.frequency} 
              onChange={handleInputChange} 
              placeholder="e.g. Once daily, Twice a day" 
              required 
            />
            <Input 
              label="Duration Days" 
              type="number" 
              name="durationDays" 
              value={form.durationDays} 
              onChange={handleInputChange} 
              placeholder="e.g. 30" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Start Date" 
              type="date" 
              name="startDate" 
              value={form.startDate} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Prescribing Doctor" 
              name="prescribingDoctor" 
              value={form.prescribingDoctor} 
              onChange={handleInputChange} 
              placeholder="e.g. Dr. Jane Watson" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Medication Purpose / Reason</label>
            <input 
              type="text"
              name="purpose"
              value={form.purpose}
              onChange={handleInputChange}
              placeholder="e.g. Lower cholesterol, Manage Type 2 Diabetes" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Special Instructions</label>
            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleInputChange}
              rows={3}
              placeholder="e.g. Take with food, avoid grapefruit juice, take in evening..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              Save Medicine
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
