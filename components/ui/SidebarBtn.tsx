import React from 'react';

export default function SidebarBtn({ active, onClick, icon, label, small }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 ${small ? 'px-4 py-3 text-sm' : 'px-5 py-4 text-base'} rounded-xl font-medium tracking-wide transition-all duration-300 relative group overflow-hidden ${
      active ? "bg-cyan-500/10 text-cyan-400 border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
    }`}>
      {/* Active Glowing Border on the left */}
      {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] rounded-r-full" />}
      
      {React.cloneElement(icon, { className: `${small ? 'w-5 h-5' : 'w-6 h-6'} shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}` })} 
      <span className="text-left">{label}</span>
    </button>
  );
}