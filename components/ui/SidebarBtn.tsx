import React from 'react';

export default function SidebarBtn({ active, onClick, icon, label, small }: any) {
  return (
      <button onClick={onClick} className={`w-full flex items-center gap-3 ${small ? 'px-3 py-2 text-xs' : 'px-3 py-2.5 text-sm'} rounded-lg font-medium tracking-wide transition-all duration-300 relative group overflow-hidden ${
      active ? "bg-cyan-500/10 text-cyan-400 border border-white/5 shadow-inner" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
    }`}>
      {/* Active Glowing Border on the left */}
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-r-full" />}
      
      {React.cloneElement(icon, { className: `${small ? 'w-4 h-4' : 'w-5 h-5'} shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}` })} 
      <span className="text-left font-medium">{label}</span>
    </button>
  );
}