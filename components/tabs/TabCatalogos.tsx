import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Clock, Plus, Link2, Unlink, Search, 
  CheckCircle2, XCircle, Smartphone, LayoutDashboard, Users, GripVertical, Info, FileText, BarChart3, Download, Camera, AlertTriangle, ChevronDown, Briefcase
} from 'lucide-react';
import { Posto, Apontamento, Prestadora, Servico, Escala, Perfil } from '../../types';
import { formatMoney } from '../../utils/formatters';

export default function TabCatalogos({ servicos, escalas, onCreateServico, onCreateEscala }: any) {
  const [nomeServ, setNomeServ] = useState("");
  const [nomeEscala, setNomeEscala] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState<number>(8);

  const handleServico = () => { if (nomeServ.trim()) { onCreateServico(nomeServ); setNomeServ(""); }};
  const handleEscala = () => { if (nomeEscala.trim() && cargaHoraria > 0) { onCreateEscala(nomeEscala, cargaHoraria); setNomeEscala(""); }};

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto fade-in">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
          <Clock className="w-10 h-10 text-cyan-400" /> Jornada - Escala
        </h2>
        <p className="text-slate-400 mt-2 text-lg">Gerencie os serviços prestados e as escalas (cargas horárias) operacionais.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Catálogo de Serviços */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 flex flex-col shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><Users className="text-cyan-400"/> Catálogo de Serviços</h3>
          
          <div className="flex gap-4 mb-8">
            <input value={nomeServ} onChange={e=>setNomeServ(e.target.value)} placeholder="Ex: Porteiro, Vigilante, Recepcionista" className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-5 py-3 text-white focus:border-cyan-400 outline-none" />
            <button onClick={handleServico} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center gap-2"><Plus className="w-5 h-5"/> Novo</button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px] border border-slate-800 rounded-2xl bg-slate-950/30">
            {servicos.map((s:any) => (
              <div key={s.id} className="p-4 border-b border-slate-800/50 flex justify-between items-center hover:bg-slate-800/30">
                <span className="font-bold text-slate-300">{s.nome}</span>
              </div>
            ))}
            {servicos.length === 0 && <div className="p-8 text-center text-slate-500">N nenhum serviço cadastrado.</div>}
          </div>
        </div>

        {/* Catálogo de Escalas */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 flex flex-col shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><Clock className="text-emerald-400"/> Catálogo de Escalas</h3>
          
          <div className="flex gap-4 mb-8">
            <div className="flex-1 flex flex-col gap-2">
              <input value={nomeEscala} onChange={e=>setNomeEscala(e.target.value)} placeholder="Ex: Comercial, 12x36" className="bg-slate-950/50 border border-slate-700 rounded-xl px-5 py-3 text-white focus:border-emerald-400 outline-none" />
              <input type="number" value={cargaHoraria} onChange={e=>setCargaHoraria(Number(e.target.value))} placeholder="Horas (Ex: 8)" className="bg-slate-950/50 border border-slate-700 rounded-xl px-5 py-3 text-white focus:border-emerald-400 outline-none" title="Carga Horária (horas)" />
            </div>
            <button onClick={handleEscala} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center gap-2 h-[50px]"><Plus className="w-5 h-5"/> Nova</button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px] border border-slate-800 rounded-2xl bg-slate-950/30">
            {escalas.map((e:any) => (
              <div key={e.id} className="p-4 border-b border-slate-800/50 flex justify-between items-center hover:bg-slate-800/30">
                <span className="font-bold text-slate-300">{e.nome}</span>
                <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-md text-xs font-mono">{e.carga_horaria}h</span>
              </div>
            ))}
            {escalas.length === 0 && <div className="p-8 text-center text-slate-500">Nenhuma escala cadastrada.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}