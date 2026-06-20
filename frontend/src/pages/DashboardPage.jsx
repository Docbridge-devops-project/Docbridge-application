import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { healthSummaryApi } from '../api/healthSummaryApi';
import { formatDate, formatRelativeDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    healthSummaryApi.getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  const d = data || {};
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}, {user?.first_name || 'there'} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Here's your health overview</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-slate-500">Health Score</p>
            <p className="text-2xl font-bold text-teal-400">{d.healthScore || 80}</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-teal-500/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-teal-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Consultations', value: d.consultations?.total || 0, icon: '🩺', path: '/consultations', color: 'from-blue-500/20 to-indigo-500/10' },
          { label: 'Active Meds', value: d.activeMedicationCount || 0, icon: '💊', path: '/prescriptions', color: 'from-teal-500/20 to-cyan-500/10' },
          { label: 'Ongoing Symptoms', value: d.ongoingSymptomCount || 0, icon: '📋', path: '/symptoms', color: 'from-amber-500/20 to-orange-500/10' },
          { label: 'Active Reminders', value: d.activeReminderCount || 0, icon: '⏰', path: '/reminders', color: 'from-purple-500/20 to-pink-500/10' },
        ].map((stat) => (
          <Link key={stat.path} to={stat.path}>
            <Card hover className={`bg-gradient-to-br ${stat.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Active Medications</h3>
            <Link to="/prescriptions" className="text-xs text-teal-400 hover:text-teal-300">View all →</Link>
          </div>
          {(!Array.isArray(d.activeMedications) || d.activeMedications.length === 0) ? (
            <p className="text-sm text-slate-500">No active medications</p>
          ) : (
            <div className="space-y-3">
              {d.activeMedications.slice(0, 4).map((med, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{med.medicine_name}</p>
                    <p className="text-xs text-slate-500">{med.dosage} — {med.frequency}</p>
                  </div>
                  <StatusBadge status="active" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Upcoming Follow-ups</h3>
            <Link to="/reminders" className="text-xs text-teal-400 hover:text-teal-300">View all →</Link>
          </div>
          {(!Array.isArray(d.upcomingFollowups) || d.upcomingFollowups.length === 0) ? (
            <p className="text-sm text-slate-500">No upcoming follow-ups</p>
          ) : (
            <div className="space-y-3">
              {d.upcomingFollowups.map((fu, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{fu.title}</p>
                    <p className="text-xs text-slate-500">{formatRelativeDate(fu.reminder_date)}</p>
                  </div>
                  <StatusBadge status="scheduled" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Ongoing Symptoms</h3>
          <Link to="/symptoms" className="text-xs text-teal-400 hover:text-teal-300">View all →</Link>
        </div>
        {(!Array.isArray(d.ongoingSymptoms) || d.ongoingSymptoms.length === 0) ? (
          <p className="text-sm text-slate-500">No ongoing symptoms — great news! 🎉</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {d.ongoingSymptoms.map((s, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-200">{s.symptom_name}</p>
                  <span className="text-xs text-amber-400">{s.severity}/10</span>
                </div>
                <p className="text-xs text-slate-500">{s.body_location || 'General'}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="text-center py-4">
        <Link to="/ai" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg shadow-teal-500/25">
          🤖 Chat with AI Companion
        </Link>
      </div>
    </div>
  );
}
