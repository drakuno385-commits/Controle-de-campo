"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Building2, MapPin, DollarSign, Smartphone } from "lucide-react";

const navItems = [
  { name: "Dashboard Geral", path: "/", icon: LayoutDashboard },
  { name: "Gestão de Apontamentos", path: "/os", icon: ClipboardList },
  { name: "Empresas", path: "/empresas", icon: Building2 },
  { name: "Postos & Unidades", path: "/postos", icon: MapPin },
  { name: "Vínculos & Contratos", path: "/vinculos", icon: DollarSign },
  { name: "Simulador do Técnico", path: "/simulador", icon: Smartphone },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] shrink-0 border-r border-white/5 glass-panel flex flex-col fixed inset-y-0 left-0 z-50">
      
      {/* Logo Area */}
      <div className="p-6 pb-8 border-b border-white/5 text-center">
        <div className="font-display flex justify-center items-baseline gap-1">
          <span className="text-3xl font-black text-brand-blue drop-shadow-[0_0_12px_rgba(0,243,255,0.5)]">GWEP</span>
          <span className="text-3xl font-light text-white">FIELD</span>
        </div>
        <span className="text-xs font-medium text-slate-400 block mt-2 tracking-wide uppercase">Gestão Operacional</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
        <div className="text-[10px] font-bold text-brand-orange uppercase tracking-widest px-4 mb-2">Menu Principal</div>
        
        {navItems.map((item, idx) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={idx}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 w-full text-left font-semibold text-sm ${
                isActive 
                  ? "bg-brand-blue/10 border border-brand-blue/30 text-white shadow-[0_0_20px_rgba(0,243,255,0.15)] border-l-4 border-l-brand-blue" 
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent border-l-4 border-l-transparent"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-brand-blue drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={isActive ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : ""}>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Connected Env Card */}
      <div className="p-5 mt-auto">
        <div className="bg-slate-900/60 border border-brand-blue/20 rounded-xl p-4 shadow-lg backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent"></div>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-green shadow-[0_0_8px_#10b981]"></span>
            </div>
            <div className="text-[11px] font-display font-bold text-brand-blue uppercase tracking-wider">Ambiente Conectado</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200 font-semibold">Simulador Mobile</strong> transmitindo dados de GPS em tempo real.
          </p>
        </div>
      </div>
    </aside>
  );
}
