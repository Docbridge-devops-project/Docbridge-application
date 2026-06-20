import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { familyApi } from '../api/familyApi';
import { getInitials } from '../utils/formatters';

export default function FamilyPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Form State
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    relationship: 'spouse', // default enum value
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    bloodGroup: '',
    knownAllergies: '', // we will split by comma
    chronicConditions: '', // we will split by comma
    notes: '',
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    familyApi.list()
      .then(res => {
        setMembers(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Failed to load family members:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        knownAllergies: form.knownAllergies 
          ? form.knownAllergies.split(',').map(a => a.trim()).filter(a => a.length > 0)
          : [],
        chronicConditions: form.chronicConditions 
          ? form.chronicConditions.split(',').map(c => c.trim()).filter(c => c.length > 0)
          : [],
        dateOfBirth: form.dateOfBirth || null,
        bloodGroup: form.bloodGroup || null,
      };

      const res = await familyApi.create(payload);
      if (res.data?.success) {
        setShowCreate(false);
        setForm({
          firstName: '',
          lastName: '',
          relationship: 'spouse',
          dateOfBirth: '',
          gender: 'prefer_not_to_say',
          bloodGroup: '',
          knownAllergies: '',
          chronicConditions: '',
          notes: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to create family profile';
      const details = err.response?.data?.errors?.map(e => e.message).join(', ');
      setFormError(details ? `${msg}: ${details}` : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;
    try {
      await familyApi.delete(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Failed to delete family member:", err);
      alert("Failed to delete family member.");
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Family Profiles
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage physical stats, medical history, and allergies of family members</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
          + Add Member
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="min-h-[40vh]" />
      ) : members.length === 0 ? (
        <EmptyState 
          icon="👨‍👩‍👧‍👦" 
          title="No family profiles registered yet" 
          description="Create profiles for your spouse, children, or parents to track their consultations, reminders, and lab reports." 
          action={<Button onClick={() => setShowCreate(true)}>Add Family Member</Button>} 
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(m => {
            const age = calculateAge(m.date_of_birth);
            return (
              <Card key={m.id} className="relative bg-white/5 border border-white/5 hover:border-teal-500/20 transition-all p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center text-md font-bold text-teal-300">
                        {getInitials(m.first_name, m.last_name)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-100 text-base">{m.first_name} {m.last_name}</h3>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 px-2 py-0.5 bg-teal-500/10 rounded-md border border-teal-500/20">
                            {m.relationship}
                          </span>
                          {age !== null && (
                            <span className="text-xs text-slate-400">
                              Age: {age} yrs
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(m.id)}
                      className="text-slate-500 hover:text-red-400 text-xs transition-colors p-2"
                      title="Remove profile"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Conditions */}
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Known Conditions</h4>
                      {m.chronic_conditions && m.chronic_conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {m.chronic_conditions.map((c, i) => (
                            <Badge key={i} variant="warning">
                              ⚠️ {c}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No chronic conditions logged.</p>
                      )}
                    </div>

                    {/* Allergies */}
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Allergies</h4>
                      {m.known_allergies && m.known_allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {m.known_allergies.map((a, i) => (
                            <Badge key={i} variant="danger" className="bg-red-500/10 border-red-500/20 text-red-400">
                              🚫 {a}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No known allergies logged.</p>
                      )}
                    </div>
                  </div>
                </div>

                {m.notes && (
                  <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 bg-slate-950/20 p-2.5 rounded-xl">
                    <span className="text-slate-500 font-semibold block mb-0.5">Clinical Notes:</span>
                    {m.notes}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Family Member Profile">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              name="firstName" 
              value={form.firstName} 
              onChange={handleInputChange} 
              placeholder="e.g. Jane" 
              required 
            />
            <Input 
              label="Last Name" 
              name="lastName" 
              value={form.lastName} 
              onChange={handleInputChange} 
              placeholder="e.g. Smith" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Relationship</label>
              <select
                name="relationship"
                value={form.relationship}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
              >
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="grandparent">Grandparent</option>
                <option value="grandchild">Grandchild</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Date of Birth" 
              type="date" 
              name="dateOfBirth" 
              value={form.dateOfBirth} 
              onChange={handleInputChange} 
              required
            />
            <Input 
              label="Blood Group (Optional)" 
              name="bloodGroup" 
              value={form.bloodGroup} 
              onChange={handleInputChange} 
              placeholder="e.g. O+, A-" 
            />
          </div>

          <Input 
            label="Known Conditions (comma-separated)" 
            name="chronicConditions" 
            value={form.chronicConditions} 
            onChange={handleInputChange} 
            placeholder="e.g. Asthma, Hypertension" 
          />

          <Input 
            label="Allergies (comma-separated)" 
            name="knownAllergies" 
            value={form.knownAllergies} 
            onChange={handleInputChange} 
            placeholder="e.g. Penicillin, Peanuts" 
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Notes / Medical Comments</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleInputChange}
              rows={2}
              placeholder="e.g. Known drug reactions, emergency instructions..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              Save Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
