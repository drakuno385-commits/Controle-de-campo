import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Clock, Plus, Link2, Unlink, Search, 
  CheckCircle2, XCircle, Smartphone, LayoutDashboard, Users, GripVertical, Info, FileText, BarChart3, Download, Camera, AlertTriangle, ChevronDown, Briefcase
} from 'lucide-react';
import { Posto, Apontamento, Prestadora, Servico, Escala, Perfil } from '../../types';
import { formatMoney } from '../../utils/formatters';

export default function TabUsuarios({ perfis, onSave }: any) {
  const defaults: Partial<Perfil> = { email: "", role: "OPERADOR", telas_permitidas: [] };
  const [novo, setNovo] = useState<Partial<Perfil>>(defaults);
  const [editingId, setEditingId] = useState<string | null>(null);

  const TELAS_SISTEMA = [
    { id: 'empresas', nome: 'Empresas' },
    { id: 'postos', nome: 'Postos de Serviço' },
    { id: 'catalogos', nome: 'Jornada - Escala' },
    { id: 'vinculos', nome: 'Vínculos Operacionais' },
    { id: 'simulador', nome: 'App do Técnico' },
    { id: 'os', nome: 'Auditoria (Logs)' },
    { id: 'medicao', nome: 'Medição e Relatórios' },
    { id: 'usuarios', nome: 'Controle de Usuários (Admin)' }
  ];

  const toggleTela = (id: string) => {
    setNovo(n => {
      const perms = n.telas_permitidas || [];
      if (perms.includes(id)) return { ...n, telas_permitidas: perms.filter(x => x !== id) };
      return { ...n, telas_permitidas: [...perms, id] };
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onSave(novo as Perfil);
    else onSave(novo as Perfil);
    setNovo(defaults);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full fade-in">
      <div className="w-full xl:w-[480px] shrink-0 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-2xl h-fit">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-cyan-400" /> {editingId ? "Editar Perfil" : "Novo Perfil (Convite)"}
          </h2>
          {editingId && <button type="button" onClick={()=>{setNovo(defaults); setEditingId(null);}} className="text-xs text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 px-3 py-1.5 rounded-lg">Cancelar</button>}
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div>
            <label className="text-sm font-semibold text-slate-400 block mb-2">E-mail do Usuário</label>
            <input required type="email" value={novo.email} onChange={e=>setNovo({...novo, email: e.target.value})} disabled={!!editingId} placeholder="usuario@gwep.com.br" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-base text-slate-200 focus:border-cyan-400/50 outline-none transition-colors disabled:opacity-50" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-400 block mb-2">Nível de Acesso (Role)</label>
            <select value={novo.role} onChange={e=>setNovo({...novo, role: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-base text-slate-200 focus:border-cyan-400/50 outline-none transition-colors appearance-none">
              <option value="OPERADOR">OPERADOR (Restrito)</option>
              <option value="MASTER">MASTER (Acesso Total)</option>
            </select>
          </div>
          
          {novo.role === 'OPERADOR' && (
            <div className="border border-slate-800/80 bg-slate-950/30 rounded-2xl p-5">
              <label className="text-sm font-bold text-slate-300 block mb-4">Permissões de Telas</label>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {TELAS_SISTEMA.map(t => (
                  <label key={t.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-900/50 rounded-xl transition-colors">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${novo.telas_permitidas?.includes(t.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-900 border-slate-700 group-hover:border-slate-500'}`}>
                      {novo.telas_permitidas?.includes(t.id) && <CheckCircle2 className="w-3 h-3 text-slate-900" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={novo.telas_permitidas?.includes(t.id) || false} onChange={() => toggleTela(t.id)} />
                    <span className="text-sm font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">{t.nome}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-2xl text-lg shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] hover:-translate-y-0.5 active:translate-y-0 transition-all">
            {editingId ? "Salvar Permissões" : "Cadastrar Perfil"}
          </button>
        </form>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {perfis.length === 0 && <p className="text-slate-500 col-span-full">Nenhum perfil cadastrado.</p>}
          {perfis.map((p: Perfil) => (
            <div key={p.id} className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 hover:border-slate-700 hover:bg-slate-900/70 transition-all duration-300 backdrop-blur-md shadow-xl flex flex-col relative group">
              <button onClick={()=>{setNovo(p); setEditingId(p.id!);}} className="absolute top-4 right-4 text-cyan-500/50 hover:text-cyan-400 p-2 hover:bg-cyan-500/10 rounded-xl transition-colors">
                Editar
              </button>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-inner border ${p.role === 'MASTER' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                  {p.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-slate-100 font-bold tracking-tight text-lg leading-tight">{p.email}</h3>
                  <span className={`text-xs font-black tracking-widest uppercase ${p.role === 'MASTER' ? 'text-cyan-500' : 'text-slate-500'}`}>{p.role}</span>
                </div>
              </div>
              
              {p.role === 'OPERADOR' && (
                <div className="mt-2 pt-4 border-t border-slate-800/50">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Acesso Permitido</p>
                  <div className="flex flex-wrap gap-2">
                    {p.telas_permitidas.length === 0 && <span className="text-xs text-rose-500/80 font-bold bg-rose-500/10 px-2 py-1 rounded">Nenhuma aba permitida</span>}
                    {p.telas_permitidas.map(t => {
                      const tName = TELAS_SISTEMA.find(s=>s.id === t)?.nome || t;
                      return <span key={t} className="text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-md">{tName}</span>
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}