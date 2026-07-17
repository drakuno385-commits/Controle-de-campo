import React, { useState } from 'react';
import { 
  Clock, Plus, Users, X, ChevronRight, Bookmark, Calendar
} from 'lucide-react';
import { Servico, Escala } from '../../types';

export default function TabCatalogos({ servicos, escalas, onCreateServico, onCreateEscala }: any) {
  const [drawerServicoOpen, setDrawerServicoOpen] = useState(false);
  const [drawerEscalaOpen, setDrawerEscalaOpen] = useState(false);
  
  const [nomeServ, setNomeServ] = useState("");
  const [nomeEscala, setNomeEscala] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState<number>(8);

  const handleServico = (e: React.FormEvent) => { 
    e.preventDefault();
    if (nomeServ.trim()) { 
      onCreateServico(nomeServ); 
      setNomeServ(""); 
      setDrawerServicoOpen(false);
    }
  };
  
  const handleEscala = (e: React.FormEvent) => { 
    e.preventDefault();
    if (nomeEscala.trim() && cargaHoraria > 0) { 
      onCreateEscala(nomeEscala, cargaHoraria); 
      setNomeEscala(""); 
      setCargaHoraria(8);
      setDrawerEscalaOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative fade-in">
      
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Gestão de Catálogos
          </h2>
          <p className="text-sm text-slate-500 mt-1">Gerencie os tipos de serviços prestados e as matrizes de escalas.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDrawerServicoOpen(true)}
            className="bg-white/5 border border-white/10 text-slate-300 font-medium px-5 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-cyan-400" /> Novo Serviço
          </button>
          <button 
            onClick={() => setDrawerEscalaOpen(true)}
            className="bg-white/5 border border-white/10 text-slate-300 font-medium px-5 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> Nova Escala
          </button>
        </div>
      </div>
      
      {/* MAIN GRIDS */}
      <div className="flex-1 overflow-y-auto pr-2 pb-6 grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        
        {/* Catálogo de Serviços */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-lg backdrop-blur-2xl flex flex-col group relative overflow-hidden transition-all hover:bg-white/[0.03]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-700" />
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10"><Bookmark className="text-cyan-400 w-5 h-5"/> Serviços (Cargos)</h3>
          
          <div className="flex-1 space-y-2 relative z-10">
            {servicos.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">Nenhum serviço cadastrado.</div>}
            {servicos.map((s:any) => (
              <div key={s.id} className="px-4 py-2.5 bg-[#0A1120]/60 border border-white/5 rounded-lg flex justify-between items-center hover:border-cyan-500/30 transition-colors">
                <span className="text-sm font-bold text-slate-300">{s.nome}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Catálogo de Escalas */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-lg backdrop-blur-2xl flex flex-col group relative overflow-hidden transition-all hover:bg-white/[0.03]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-700" />
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10"><Calendar className="text-emerald-400 w-5 h-5"/> Matrizes de Escala</h3>
          
          <div className="flex-1 space-y-2 relative z-10">
            {escalas.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">Nenhuma escala cadastrada.</div>}
            {escalas.map((e:any) => (
              <div key={e.id} className="px-4 py-2.5 bg-[#0A1120]/60 border border-white/5 rounded-lg flex justify-between items-center hover:border-emerald-500/30 transition-colors">
                <span className="text-sm font-bold text-slate-300">{e.nome}</span>
                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest">{e.carga_horaria}h Totais</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* DRAWER: NOVO SERVIÇO */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${drawerServicoOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setDrawerServicoOpen(false)} />
        
        <div className={`relative w-[400px] bg-[#0A1120] border-l border-white/10 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${drawerServicoOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              <Plus className="w-5 h-5 text-cyan-400" /> Novo Serviço
            </h2>
            <button onClick={() => setDrawerServicoOpen(false)} className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <form id="novoServicoForm" onSubmit={handleServico} className="flex flex-col gap-6">
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Nome do Cargo/Serviço</label>
                <div className="relative">
                  <Bookmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                  <input required type="text" value={nomeServ} onChange={e=>setNomeServ(e.target.value)} placeholder="Ex: Porteiro, Recepcionista" className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-slate-200 focus:border-cyan-400 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] outline-none transition-all placeholder:text-slate-600 font-medium" />
                </div>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-white/5 bg-white/[0.01]">
            <button form="novoServicoForm" type="submit" className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl text-sm shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
              Salvar Serviço <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DRAWER: NOVA ESCALA */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${drawerEscalaOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setDrawerEscalaOpen(false)} />
        
        <div className={`relative w-[400px] bg-[#0A1120] border-l border-white/10 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${drawerEscalaOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              <Plus className="w-5 h-5 text-emerald-400" /> Nova Escala
            </h2>
            <button onClick={() => setDrawerEscalaOpen(false)} className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <form id="novaEscalaForm" onSubmit={handleEscala} className="flex flex-col gap-6">
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Identificação da Escala</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                  <input required type="text" value={nomeEscala} onChange={e=>setNomeEscala(e.target.value)} placeholder="Ex: Comercial, 12x36" className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-slate-200 focus:border-emerald-400 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] outline-none transition-all placeholder:text-slate-600 font-medium" />
                </div>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Carga Horária (Mensal)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                  <input required type="number" value={cargaHoraria||''} onChange={e=>setCargaHoraria(Number(e.target.value))} placeholder="Ex: 220" className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm font-mono text-slate-200 focus:border-emerald-400 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] outline-none transition-all placeholder:text-slate-600" />
                </div>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-white/5 bg-white/[0.01]">
            <button form="novaEscalaForm" type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
              Salvar Escala <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}