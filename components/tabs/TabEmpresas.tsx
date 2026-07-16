import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Clock, Plus, Link2, Unlink, Search, 
  CheckCircle2, XCircle, Smartphone, LayoutDashboard, Users, GripVertical, Info, FileText, BarChart3, Download, Camera, AlertTriangle, ChevronDown, Briefcase
} from 'lucide-react';
import { Posto, Apontamento, Prestadora, Servico, Escala, Perfil } from '../../types';
import { formatMoney } from '../../utils/formatters';

export default function TabEmpresas({ prestadoras, onCreate }: any) {
  const [nova, setNova] = useState({ nome: '', cnpj: '' });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ id: `prest-${Date.now()}`, ...nova });
    setNova({ nome: '', cnpj: '' });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full fade-in">
      <div className="w-full xl:w-[480px] shrink-0 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-2xl h-fit">
        <h2 className="text-2xl font-bold text-slate-100 mb-8 tracking-tight flex items-center gap-3">
          <Plus className="w-6 h-6 text-cyan-400" /> Nova Empresa
        </h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div>
            <label className="text-sm font-semibold text-slate-400 block mb-2">Razão Social / Nome Fantasia</label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input required type="text" value={nova.nome} onChange={e=>setNova({...nova, nome: e.target.value})} placeholder="Ex: GWEP Segurança" className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-base text-slate-200 focus:border-cyan-400/50 focus:bg-slate-950/80 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-400 block mb-2">CNPJ</label>
            <div className="relative group">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input required type="text" value={nova.cnpj} onChange={e=>setNova({...nova, cnpj: e.target.value})} placeholder="00.000.000/0001-00" className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-base font-mono text-slate-200 focus:border-cyan-400/50 focus:bg-slate-950/80 outline-none transition-all" />
            </div>
          </div>
          <button type="submit" className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-2xl text-lg shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] hover:-translate-y-0.5 active:translate-y-0 transition-all">
            Cadastrar Empresa
          </button>
        </form>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-6">
          {prestadoras.length === 0 && <p className="text-slate-500 col-span-full">Nenhuma prestadora cadastrada.</p>}
          {prestadoras.map((p: Prestadora) => (
            <div key={p.id} className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 hover:border-cyan-500/30 hover:bg-slate-900/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-md group shadow-xl">
              <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mb-5 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all">
                <Building2 className="w-7 h-7 text-cyan-500" />
              </div>
              <h3 className="text-slate-100 font-bold tracking-tight text-xl mb-1">{p.nome}</h3>
              <p className="text-sm font-mono text-slate-500">{p.cnpj}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}