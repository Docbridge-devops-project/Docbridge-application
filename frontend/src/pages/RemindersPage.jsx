import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { reminderApi } from '../api/reminderApi';
import { formatDate, formatRelativeDate } from '../utils/formatters';

export default function RemindersPage() {
  const [upcoming, setUpcoming] = useState({ medicineReminders: [], followupReminders: [] });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [reminderType, setReminderType] = useState('medicine'); // 'medicine' | 'followup'

  // Medicine Form State
  const [medForm, setMedForm] = useState({
    medicineName: '',
    dosage: '',
    reminderTimes: '', // e.g. "08:00, 20:00"
    startDate: '',
    endDate: '',
    notes: '',
  });

  // Follow-up Form State
  const [followForm, setFollowForm] = useState({
    title: '',
    description: '',
    reminderDate: '',
    reminderTime: '',
    reminderType: 'followup', // 'followup','test','vaccination','checkup','refill','other'
    notes: '',
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Taken/Skipped feedback log (local feedback)
  const [localFeedback, setLocalFeedback] = useState({});

  const fetchData = () => {
    setLoading(true);
    reminderApi.getUpcoming()
      .then(res => {
        setUpcoming(res.data?.data || { medicineReminders: [], followupReminders: [] });
      })
      .catch((err) => {
        console.error("Failed to load reminders:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMedInputChange = (e) => {
    const { name, value } = e.target;
    setMedForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFollowInputChange = (e) => {
    const { name, value } = e.target;
    setFollowForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (reminderType === 'medicine') {
        const timesArray = medForm.reminderTimes
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0);

        if (timesArray.length === 0) {
          throw new Error('Please provide at least one reminder time (e.g. 08:00)');
        }

        const payload = {
          ...medForm,
          reminderTimes: timesArray,
          endDate: medForm.endDate || null,
        };

        const res = await reminderApi.createMedicine(payload);
        if (res.data?.success) {
          setShowCreate(false);
          setMedForm({
            medicineName: '',
            dosage: '',
            reminderTimes: '',
            startDate: '',
            endDate: '',
            notes: '',
          });
          fetchData();
        }
      } else {
        const payload = {
          ...followForm,
          reminderTime: followForm.reminderTime || null,
        };

        const res = await reminderApi.createFollowup(payload);
        if (res.data?.success) {
          setShowCreate(false);
          setFollowForm({
            title: '',
            description: '',
            reminderDate: '',
            reminderTime: '',
            reminderType: 'followup',
            notes: '',
          });
          fetchData();
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to create reminder';
      const details = err.response?.data?.errors?.map(e => e.message).join(', ');
      setFormError(details ? `${msg}: ${details}` : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteFollowup = async (id) => {
    try {
      const res = await reminderApi.completeFollowup(id);
      if (res.data?.success) {
        setUpcoming(prev => ({
          ...prev,
          followupReminders: prev.followupReminders.filter(r => r.id !== id)
        }));
      }
    } catch (err) {
      console.error("Failed to complete followup:", err);
      alert("Failed to complete follow-up reminder.");
    }
  };

  const handleLogIntake = (id, type) => {
    // Local animation state
    setLocalFeedback(prev => ({
      ...prev,
      [id]: type // 'taken' | 'skipped'
    }));

    setTimeout(() => {
      // Clear after feedback animation
      setLocalFeedback(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }, 4000);
  };

  const handleDeleteReminder = async (id, type) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    try {
      if (type === 'medicine') {
        await reminderApi.deleteMedicine(id);
        setUpcoming(prev => ({
          ...prev,
          medicineReminders: prev.medicineReminders.filter(r => r.id !== id)
        }));
      } else {
        await reminderApi.deleteFollowup(id);
        setUpcoming(prev => ({
          ...prev,
          followupReminders: prev.followupReminders.filter(r => r.id !== id)
        }));
      }
    } catch (err) {
      console.error("Failed to delete reminder:", err);
      alert("Failed to delete reminder.");
    }
  };

  const getReminderTypeEmoji = (type) => {
    switch (type) {
      case 'followup': return '🩺';
      case 'test': return '🔬';
      case 'vaccination': return '💉';
      case 'checkup': return '🏥';
      case 'refill': return '💊';
      default: return '📅';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Reminders
          </h1>
          <p className="text-slate-400 text-sm mt-1">Stay on top of your daily medications and medical appointments</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
          + Add Reminder
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="min-h-[40vh]" />
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* 💊 Medicine Reminders Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>💊</span> Medicine Reminders
            </h2>
            {upcoming.medicineReminders.length === 0 ? (
              <EmptyState
                icon="💊"
                title="No active medicine reminders"
                description="Keep track of your dosages by logging a medicine reminder."
                action={<Button onClick={() => { setReminderType('medicine'); setShowCreate(true); }} variant="secondary">Add Medicine Reminder</Button>}
              />
            ) : (
              <div className="space-y-4">
                {upcoming.medicineReminders.map(r => {
                  const feedback = localFeedback[r.id];
                  return (
                    <div 
                      key={r.id} 
                      className={`relative bg-white/5 border rounded-2xl p-5 space-y-4 transition-all duration-300 ${
                        feedback === 'taken' 
                          ? 'border-emerald-500/40 bg-emerald-950/10' 
                          : feedback === 'skipped'
                          ? 'border-amber-500/40 bg-amber-950/10 opacity-70'
                          : 'border-white/5'
                      }`}
                    >
                      {/* Intake Feedback Overlay */}
                      {feedback && (
                        <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex items-center justify-center animate-fade-in z-10">
                          <span className={`text-sm font-bold flex items-center gap-2 ${feedback === 'taken' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {feedback === 'taken' ? '✅ Logged: Dose Marked Taken!' : '⏰ Logged: Dose Skipped'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-100">{r.medicine_name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Dosage: <span className="text-teal-400 font-medium">{r.dosage}</span>
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteReminder(r.id, 'medicine')}
                          className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                          title="Delete reminder"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex flex-wrap items-center gap-3">
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Scheduled:</span>
                        {(r.reminder_times || []).map((t, idx) => (
                          <span key={idx} className="bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs px-2.5 py-1 rounded-lg font-semibold">
                            ⏰ {t}
                          </span>
                        ))}
                      </div>

                      {r.notes && (
                        <p className="text-xs text-slate-400 italic">💡 {r.notes}</p>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <Button 
                          onClick={() => handleLogIntake(r.id, 'taken')}
                          className="flex-1 py-2 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                        >
                          Mark as Taken
                        </Button>
                        <Button 
                          onClick={() => handleLogIntake(r.id, 'skipped')}
                          variant="secondary"
                          className="flex-1 py-2 text-xs hover:bg-white/10"
                        >
                          Skip
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 📅 Follow-up Reminders Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📅</span> Follow-up Reminders
            </h2>
            {upcoming.followupReminders.length === 0 ? (
              <EmptyState
                icon="🩺"
                title="No upcoming follow-up visits"
                description="Upcoming checkups, clinic visits, or refills will appear here."
                action={<Button onClick={() => { setReminderType('followup'); setShowCreate(true); }} variant="secondary">Add Follow-up Reminder</Button>}
              />
            ) : (
              <div className="space-y-4">
                {upcoming.followupReminders.map(r => (
                  <div 
                    key={r.id} 
                    className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4 transition-all hover:border-teal-500/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center">
                          {getReminderTypeEmoji(r.reminder_type)}
                        </span>
                        <div>
                          <h3 className="text-md font-semibold text-slate-100">{r.title}</h3>
                          <p className="text-xs text-slate-400 capitalize">{r.reminder_type || 'Follow-up'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteReminder(r.id, 'followup')}
                        className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                        title="Delete reminder"
                      >
                        🗑️
                      </button>
                    </div>

                    {r.description && (
                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/20 p-3 rounded-xl border border-white/5">
                        {r.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-3">
                      <div>
                        Date: <span className="text-teal-400 font-semibold">{formatDate(r.reminder_date)}</span>
                        {r.reminder_time && <span> at {r.reminder_time}</span>}
                      </div>
                      <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full font-medium">
                        {formatRelativeDate(r.reminder_date)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2">
                      <Button 
                        onClick={() => handleCompleteFollowup(r.id)}
                        className="w-full py-2 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold"
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add Reminder Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Health Reminder">
        {/* Toggle Type Selector */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-4 border border-white/5">
          <button 
            type="button"
            onClick={() => { setReminderType('medicine'); setFormError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              reminderType === 'medicine' 
                ? 'bg-teal-500 text-white font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💊 Medicine Dose
          </button>
          <button 
            type="button"
            onClick={() => { setReminderType('followup'); setFormError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              reminderType === 'followup' 
                ? 'bg-teal-500 text-white font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📅 Follow-up / Appointment
          </button>
        </div>

        {formError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Medicine Reminder Form */}
          {reminderType === 'medicine' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Medicine Name" 
                  name="medicineName" 
                  value={medForm.medicineName} 
                  onChange={handleMedInputChange} 
                  placeholder="e.g. Paracetamol, Lipitor" 
                  required 
                />
                <Input 
                  label="Dosage" 
                  name="dosage" 
                  value={medForm.dosage} 
                  onChange={handleMedInputChange} 
                  placeholder="e.g. 500mg, 1 tablet" 
                  required 
                />
              </div>

              <Input 
                label="Reminder Times (comma-separated)" 
                name="reminderTimes" 
                value={medForm.reminderTimes} 
                onChange={handleMedInputChange} 
                placeholder="e.g. 08:00, 14:00, 21:00" 
                required 
              />

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Start Date" 
                  type="date" 
                  name="startDate" 
                  value={medForm.startDate} 
                  onChange={handleMedInputChange} 
                  required 
                />
                <Input 
                  label="End Date (Optional)" 
                  type="date" 
                  name="endDate" 
                  value={medForm.endDate} 
                  onChange={handleMedInputChange} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Notes / Directions</label>
                <textarea
                  name="notes"
                  value={medForm.notes}
                  onChange={handleMedInputChange}
                  rows={2}
                  placeholder="e.g. Take with warm water before meals..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                />
              </div>
            </div>
          ) : (
            /* Follow-up Reminder Form */
            <div className="space-y-4">
              <Input 
                label="Appointment Title / Task" 
                name="title" 
                value={followForm.title} 
                onChange={handleFollowInputChange} 
                placeholder="e.g. Annual Blood Checkup, Refill Lipitor" 
                required 
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Reminder Type</label>
                  <select
                    name="reminderType"
                    value={followForm.reminderType}
                    onChange={handleFollowInputChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                  >
                    <option value="followup">Doctor Follow-up 🩺</option>
                    <option value="test">Lab Test 🔬</option>
                    <option value="vaccination">Vaccination 💉</option>
                    <option value="checkup">Routine Checkup 🏥</option>
                    <option value="refill">Prescription Refill 💊</option>
                    <option value="other">Other 📅</option>
                  </select>
                </div>

                <Input 
                  label="Time (Optional)" 
                  type="time" 
                  name="reminderTime" 
                  value={followForm.reminderTime} 
                  onChange={handleFollowInputChange} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Date" 
                  type="date" 
                  name="reminderDate" 
                  value={followForm.reminderDate} 
                  onChange={handleFollowInputChange} 
                  required 
                />
                <Input 
                  label="Clinic / Location Notes" 
                  name="notes" 
                  value={followForm.notes} 
                  onChange={handleFollowInputChange} 
                  placeholder="e.g. City Labs, 3rd floor" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Description</label>
                <textarea
                  name="description"
                  value={followForm.description}
                  onChange={handleFollowInputChange}
                  rows={2}
                  placeholder="Details about what to bring, fasting instructions, etc..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              Save Reminder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
