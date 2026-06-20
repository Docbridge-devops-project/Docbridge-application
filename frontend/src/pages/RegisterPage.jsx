import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const pass = form.password;
    const confirm = form.confirmPassword;
    if (pass !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
      navigate('/login', {
        state: { message: 'Account created successfully. Please log in.' }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const features = [
    { icon: '🩺', name: 'Consultation Logger', desc: 'Every visit, documented clearly' },
    { icon: '💊', name: 'Prescription Tracker', desc: 'Know exactly what you take and why' },
    { icon: '🔬', name: 'Lab Report Interpreter', desc: 'Numbers explained in plain English' },
    { icon: '📋', name: 'Symptom Diary', desc: 'Track patterns before your next visit' },
    { icon: '👨‍👩‍👧‍👦', name: 'Family Profiles', desc: 'One account for your whole family' },
  ];

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row text-white overflow-y-auto font-sans relative">
      {/* Left Panel — The Showcase Side */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between py-12 px-12 xl:px-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-r border-white/5 min-h-screen">
        {/* Animated Glow Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-2xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3 max-w-xl mx-auto w-full pt-8 xl:pt-10 pb-2 mb-6 [filter:drop-shadow(0_0_24px_rgba(45,212,191,0.4))]">
          <motion.span
            className="w-4 h-4 rounded-full bg-teal-400"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-4xl xl:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">DocBridge</span>
        </div>

        {/* Middle Showcase Content */}
        <motion.div
          className="relative z-10 my-auto flex flex-col items-start max-w-xl mx-auto w-full"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeUpVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-medium mb-3"
          >
            <span>🚀</span>
            <span>Join DocBridge Today</span>
          </motion.div>

          <motion.h1
            variants={fadeUpVariants}
            className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4"
          >
            Start your health journey<br />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">today.</span>
          </motion.h1>

          <motion.p
            variants={fadeUpVariants}
            className="text-slate-400 text-base xl:text-lg leading-relaxed max-w-md xl:max-w-lg mb-6"
          >
            Join patients who finally understand their diagnoses, medicines, and lab reports.
          </motion.p>

          {/* Staggered Features List */}
          <div className="space-y-3 pt-3 w-full">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                variants={fadeUpVariants}
                className="flex items-start gap-4 group"
              >
                <div className="flex-shrink-0 bg-teal-500/10 border border-teal-500/20 rounded-lg p-1.5 flex items-center justify-center w-8 h-8 shadow-lg shadow-teal-500/5 group-hover:border-teal-500/40 transition-all duration-300">
                  <span className="text-sm text-teal-400">{feat.icon}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-teal-300 transition-colors duration-300">{feat.name}</h4>
                  <p className="text-slate-400 text-sm">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Right Panel — The Form Side */}
      <div className="flex-1 lg:w-[45%] flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-900/60 border-l border-white/5 min-h-screen relative">
        {/* Glow Orb overlay for Mobile since left panel is hidden */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden lg:hidden">
          <div className="absolute top-1/4 -left-1/4 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative z-10"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent mb-1">
              DocBridge
            </h1>
            <p className="text-slate-500 text-xs mb-4 tracking-wide">
              Your personal health companion
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
            <h2 className="text-xl font-semibold text-white mb-1">Create your account</h2>
            <p className="text-slate-400 text-sm mb-4">Start your health journey today</p>
          </div>

          <AnimatePresence mode="wait">
            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-slate-400 text-sm font-medium mb-1.5">First Name</label>
                <Input
                  placeholder="John"
                  value={form.firstName}
                  onChange={upd('firstName')}
                  required
                  className="w-full focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] focus:border-teal-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-400 text-sm font-medium mb-1.5">Last Name</label>
                <Input
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={upd('lastName')}
                  required
                  className="w-full focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] focus:border-teal-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 text-sm font-medium mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={upd('email')}
                required
                className="w-full focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] focus:border-teal-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 text-sm font-medium mb-1.5">Password</label>
              <Input
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 special"
                value={form.password}
                onChange={upd('password')}
                required
                className="w-full focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] focus:border-teal-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 text-sm font-medium mb-1.5">Confirm Password</label>
              <Input
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={upd('confirmPassword')}
                required
                className="w-full focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] focus:border-teal-500/50"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold rounded-xl py-3 shadow-lg shadow-teal-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 text-base"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span>Create Account</span>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-3 text-slate-500 text-xs uppercase tracking-wider font-semibold">or</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium hover:underline transition-colors duration-200">
              Sign in →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
