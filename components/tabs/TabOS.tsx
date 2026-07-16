import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Clock, Plus, Link2, Unlink, Search, 
  CheckCircle2, XCircle, Smartphone, LayoutDashboard, Users, GripVertical, Info, FileText, BarChart3, Download, Camera, AlertTriangle, ChevronDown, Briefcase
} from 'lucide-react';
import { Posto, Apontamento, Prestadora, Servico, Escala, Perfil } from '../../types';
import { formatMoney } from '../../utils/formatters';

export default function TabOS({ apontamentos, postos, prestadoras }: any) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-2xl h-full flex flex-col fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-100 flex items-center gap-4 tracking-tight">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl"><LayoutDashboard className="w-6 h-6 text-cyan-400" /></div>
            Auditoria de Transações (Logs)
          </h2>
          <p className="text-base text-slate-400 mt-2">Logs brutos de entradas, saídas e anomalias de horário.</p>
        </div>
        <div className="relative group">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
          <input type="text" placeholder="Buscar log..." className="bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-base text-slate-200 focus:border-cyan-400/50 outline-none w-80 transition-all shadow-inner focus:shadow-[0_0_15px_rgba(34,211,238,0.1)]" />
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-2xl border border-slate-800/80 bg-slate-950/50 shadow-inner relative">
        <table className="w-full text-left border-collapse whitespace-nowrap relative">
          <thead className="sticky top-0 z-20">
            <tr>
              <th colSpan={5} className="p-0 border-b border-slate-800 h-14 bg-slate-950/80 backdrop-blur-xl absolute inset-0 z-[-1]" />
            </tr>
            <tr className="text-slate-400 text-xs uppercase tracking-widest relative z-10">
              <th className="p-5 font-bold">Status</th>
              <th className="p-5 font-bold">Data</th>
              <th className="p-5 font-bold">Técnico</th>
              <th className="p-5 font-bold">Posto de Serviço</th>
              <th className="p-5 font-bold text-right pr-8">Empresa Terceira</th>
            </tr>
          </thead>
          <tbody className="text-base">
            {apontamentos.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-slate-500">Nenhum log registrado.</td></tr>
            )}
            {apontamentos.map((ap: Apontamento) => {
              const posto = postos.find((p:any) => p.id === ap.postoId);
              const empresa = prestadoras.find((pr:any) => pr.id === posto?.prestadoraId);
              const dt = new Date(ap.checkIn);
              
              return (
                <tr key={ap.id} className="border-b border-slate-800/50 hover:bg-slate-900/80 hover:text-white transition-colors group cursor-default relative">
                  <td className="p-0 absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-cyan-500 transition-colors" />
                  
                  <td className="p-5 pl-6">
                    {ap.status === 'Em Andamento' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm"><Clock className="w-4 h-4"/> Operando</span>}
                    {ap.status === 'Medido' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"><CheckCircle2 className="w-4 h-4"/> Medido</span>}
                    {ap.status === 'Falta' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm"><XCircle className="w-4 h-4"/> Glosa (Falta)</span>}
                  </td>
                  <td className="p-5 text-slate-400 font-mono text-sm">{dt.toLocaleDateString('pt-BR')} {dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</td>
                  <td className="p-5 text-slate-200 font-semibold">{ap.tecnico}</td>
                  <td className="p-5 text-slate-200 text-sm font-bold">{posto?.nome}</td>
                  <td className="p-5 text-slate-400 text-sm font-mono text-right pr-8">{empresa?.nome || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}