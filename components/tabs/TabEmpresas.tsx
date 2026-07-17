import React, { useState } from 'react';
import { Building2, Plus, FileText, X, ChevronRight, MoreVertical } from 'lucide-react';
import { Prestadora } from '../../types';

export default function TabEmpresas({ prestadoras, onCreate }: any) {
  const [nova, setNova] = useState({ nome: '', cnpj: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ id: `prest-${Date.now()}`, ...nova });
    setNova({ nome: '', cnpj: '' });
    setDrawerOpen(false);
  };

  return (
    <div className="h-full flex flex-col relative fade-in">
      
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Gestão de Empresas
          </h2>
          <p className="text-sm text-slate-500 mt-1">Gerencie os parceiros e prestadoras de serviço do sistema.</p>
        </div>
        <button 
          onClick={() => setDrawerOpen(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Nova Empresa
        </button>
      </div>

      {/* MAIN GRID FULL WIDTH */}
      <div className="flex-1 overflow-y-auto pr-2 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {prestadoras.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
              <Building2 className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400 font-medium text-lg">Nenhuma empresa cadastrada</p>
              <p className="text-slate-500 text-sm mt-1">Clique no botão "Nova Empresa" no topo para começar.</p>
            </div>
          )}
          {prestadoras.map((p: Prestadora) => (
            <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 backdrop-blur-2xl group shadow-lg relative">
              <button className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
              
              <div className="w-12 h-12 bg-[#0A1120]/60 border border-white/5 rounded-xl flex items-center justify-center mb-5 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all">
                <Building2 className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
              <h3 className="text-slate-100 font-bold tracking-tight text-lg mb-1 truncate pr-6">{p.nome}</h3>
              <p className="text-sm font-mono text-slate-500">{p.cnpj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SLIDE-OVER DRAWER (GAVETA DE CADASTRO) */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop escurecido */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
        
        {/* Painel lateral */}
        <div className={`relative w-[480px] bg-[#0A1120] border-l border-white/10 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              <Plus className="w-5 h-5 text-cyan-400" /> Cadastrar Empresa
            </h2>
            <button onClick={() => setDrawerOpen(false)} className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <form id="novaEmpresaForm" onSubmit={onSubmit} className="flex flex-col gap-8">
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Razão Social / Fantasia</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                  <input required type="text" value={nova.nome} onChange={e=>setNova({...nova, nome: e.target.value})} placeholder="Ex: GWEP Segurança" className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-slate-200 focus:border-cyan-400 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] outline-none transition-all placeholder:text-slate-600 font-medium" />
                </div>
                <p className="text-xs text-slate-600 mt-2 ml-1">Nome de identificação legal da empresa.</p>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">CNPJ</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                  <input required type="text" value={nova.cnpj} onChange={e=>setNova({...nova, cnpj: e.target.value})} placeholder="00.000.000/0001-00" className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm font-mono text-slate-200 focus:border-cyan-400 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] outline-none transition-all placeholder:text-slate-600" />
                </div>
                <p className="text-xs text-slate-600 mt-2 ml-1">Documento sem pontuações ou traços.</p>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-white/5 bg-white/[0.01]">
            <button form="novaEmpresaForm" type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
              Salvar Registro <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}