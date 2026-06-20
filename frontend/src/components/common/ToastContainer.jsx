export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`${colors[t.type]} border backdrop-blur-xl rounded-xl px-4 py-3 flex items-center gap-3 min-w-[280px] shadow-xl animate-slideIn`}>
          <span className="text-lg font-bold">{icons[t.type]}</span>
          <p className="text-sm flex-1">{t.message}</p>
          <button onClick={() => onRemove(t.id)} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      ))}
    </div>
  );
}
