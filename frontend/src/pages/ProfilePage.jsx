import { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/formatters';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.first_name || '', lastName: user?.last_name || '',
    phone: user?.phone || '', bloodGroup: user?.blood_group || '',
    heightCm: user?.height_cm || '', weightKg: user?.weight_kg || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        heightCm: form.heightCm === '' ? null : parseFloat(form.heightCm),
        weightKg: form.weightKg === '' ? null : parseFloat(form.weightKg),
      };
      await updateProfile(payload);
      setEditing(false);
    } catch (err) { /* handle */ }
    finally { setSaving(false); }
  };

  const upd = (k) => (e) => setForm(p => ({...p, [k]: e.target.value}));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white">
            {getInitials(user?.first_name, user?.last_name)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{user?.first_name} {user?.last_name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <Badge variant="teal" className="mt-1">{user?.role}</Badge>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={form.firstName} onChange={upd('firstName')} />
              <Input label="Last Name" value={form.lastName} onChange={upd('lastName')} />
            </div>
            <Input label="Phone" value={form.phone} onChange={upd('phone')} />
            <div className="grid grid-cols-3 gap-3">
              <Input label="Blood Group" value={form.bloodGroup} onChange={upd('bloodGroup')} />
              <Input label="Height (cm)" type="number" value={form.heightCm} onChange={upd('heightCm')} />
              <Input label="Weight (kg)" type="number" value={form.weightKg} onChange={upd('weightKg')} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              <Button loading={saving} onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Blood Group', user?.blood_group || '—'],
                ['Gender', user?.gender || '—'],
                ['Phone', user?.phone || '—'],
                ['Height', user?.height_cm ? user.height_cm + ' cm' : '—'],
                ['Weight', user?.weight_kg ? user.weight_kg + ' kg' : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-slate-500">{label}</p>
                  <p className="text-slate-200 font-medium">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500 mb-1">Allergies</p>
              <div className="flex flex-wrap gap-1">{(user?.known_allergies || []).map((a, i) => <Badge key={i} variant="danger">{a}</Badge>)}</div>
              {(!user?.known_allergies || user.known_allergies.length === 0) && <p className="text-xs text-slate-600">None listed</p>}
            </div>
            <div className="mt-3">
              <p className="text-sm text-slate-500 mb-1">Chronic Conditions</p>
              <div className="flex flex-wrap gap-1">{(user?.chronic_conditions || []).map((c, i) => <Badge key={i} variant="warning">{c}</Badge>)}</div>
              {(!user?.chronic_conditions || user.chronic_conditions.length === 0) && <p className="text-xs text-slate-600">None listed</p>}
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              <Button variant="danger" onClick={logout}>Logout</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
