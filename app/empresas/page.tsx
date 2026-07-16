"use client";

import { useState } from "react";
import { Building2, Plus, Briefcase } from "lucide-react";
import { useAppStore } from "@/store";

export default function GestaoEmpresas() {
  const { prestadoras, adicionarPrestadora, postos } = useAppStore();
  const [modalEmpresa, setModalEmpresa] = useState(false);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");

  const submitEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    adicionarPrestadora({ id: `p-${Date.now()}`, nome: nomeEmpresa, cnpj });
    setModalEmpresa(false);
    setNomeEmpresa(""); setCnpj("");
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Gestão de Empresas</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">Cadastro de fornecedores e empresas terceirizadas.</p>
        </div>
        
        <button 
          onClick={() => setModalEmpresa(true)}
          className="flex items-center gap-2 bg-brand-blue hover:bg-blue-400 text-slate-900 font-bold py-2.5 px-5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
        >
          <Plus className="w-5 h-5" />
          Nova Empresa
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prestadoras.map((prestadora) => {
          const postosAtivos = postos.filter(p => p.prestadoraId === prestadora.id).length;
          return (
            <div key={prestadora.id} className="glass-card p-6 flex flex-col hover:border-brand-blue/30 transition-all border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-brand-blue/10 p-3 rounded-xl border border-brand-blue/20">
                  <Building2 className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{prestadora.nome}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">CNPJ: {prestadora.cnpj}</p>
                </div>
              </div>
              <div className="mt-2 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-white">{postosAtivos}</span> postos vinculados
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalEmpresa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Cadastrar Empresa</h2>
            <form onSubmit={submitEmpresa} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Razão Social</label>
                <input required type="text" value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} className="mt-1 w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-brand-blue outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">CNPJ</label>
                <input required type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} className="mt-1 w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-brand-blue outline-none" placeholder="00.000.000/0000-00" />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setModalEmpresa(false)} className="flex-1 py-3 rounded-lg border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-lg bg-brand-blue text-slate-900 font-bold hover:bg-blue-400 transition-colors">Salvar Empresa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
