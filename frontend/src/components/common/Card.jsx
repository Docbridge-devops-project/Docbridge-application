export default function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${hover ? 'hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
