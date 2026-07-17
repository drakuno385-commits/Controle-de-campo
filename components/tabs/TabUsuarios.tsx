import React, { useState } from 'react';
import { 
  Users, CheckCircle2, Plus, X, ChevronRight, Shield, ChevronDown, Search, LayoutDashboard
} from 'lucide-react';
import { Perfil } from '../../types';

export default function TabUsuarios({ perfis, onSave }: any) {
  const defaults: Partial<Perfil> = { email: "", role: "OPERADOR", telas_permitidas: [] };
  const [novo, setNovo] = useState<Partial<Perfil>>(defaults);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busca, setBusca] = useState("");

  const perfisFiltrados = perfis.filter((p: Perfil) => 
    p.email.toLowerCase().includes(busca.toLowerCase())
  );

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

  const startEdit = (p: Perfil) => {
    setNovo(p);
    setEditingId(p.id!);
    setDrawerOpen(true);
  };

  const cancelEdit = () => {
    setNovo(defaults);
    setEditingId(null);
    setDrawerOpen(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) onSave(novo as Perfil);
    else onSave(novo as Perfil);
    setNovo(defaults);
    setEditingId(null);
    setDrawerOpen(false);
  };

  return (
    <div className="h-full flex flex-col relative fade-in">
      
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Controle de Usuários
          </h2>
          <p className="text-sm text-slate-500 mt-1">Gerencie os acessos, permissões e operadores do sistema.</p>
        </div>
        <button 
          onClick={() => setDrawerOpen(true)}
          className="bg-white/5 border border-white/10 text-slate-300 font-medium px-5 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-cyan-400" /> Novo Usuário
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex gap-4 mb-6 shrink-0">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
            placeholder="Buscar por e-mail..." 
            className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500/50 outline-none transition-colors"
          />
        </div>
      </div>

      {/* MAIN LIST */}
      <div className="flex-1 overflow-y-auto pr-2 pb-6">
        <div className="bg-[#0A1120]/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[30%]">Usuário / E-mail</th>
                <th className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">Nível</th>
                <th className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[45%]">Módulos Permitidos</th>
                <th className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[10%] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {perfisFiltrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">Nenhum perfil encontrado.</p>
                  </td>
                </tr>
              )}
              {perfisFiltrados.map((p: Perfil) => (
                <tr key={p.id} className="hover:bg-white/[0.02] group transition-colors">
                  <td className="px-6 py-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-sm shadow-inner border shrink-0 ${p.role === 'MASTER' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-[#0A1120]/80 text-slate-300 border-white/5'}`}>
                        {p.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-50 transition-colors truncate">{p.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-2">
                    <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded ${p.role === 'MASTER' ? 'bg-cyan-950/50 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-6 py-2">
                    {p.role === 'MASTER' ? (
                      <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950/30 text-cyan-500/80 flex items-center gap-1 w-fit"><Shield className="w-2.5 h-2.5"/> Acesso Irrestrito Total</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {p.telas_permitidas.length === 0 && <span className="text-xs text-rose-400 font-medium">Nenhum</span>}
                        {p.telas_permitidas.map(t => {
                          const tName = TELAS_SISTEMA.find(s=>s.id === t)?.nome || t;
                          return <span key={t} className="text-[8px] font-bold uppercase tracking-widest bg-[#0A1120]/60 text-slate-400 border border-white/5 px-1.5 py-0.5 rounded whitespace-nowrap">{tName}</span>
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-2 text-right">
                    <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-cyan-400 transition-colors" title="Editar">
                      <LayoutDashboard className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLIDE-OVER DRAWER (GAVETA DE CADASTRO) */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={cancelEdit} />
        
        <div className={`relative w-[480px] bg-[#0A1120] border-l border-white/10 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              <Users className="w-5 h-5 text-cyan-400" /> {editingId ? "Editar Perfil" : "Novo Perfil (Convite)"}
            </h2>
            <button onClick={cancelEdit} className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <form id="novoUsuarioForm" onSubmit={onSubmit} className="flex flex-col gap-6">
              
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">E-mail de Acesso</label>
                <div className="relative">
                  <input required type="email" value={novo.email} onChange={e=>setNovo({...novo, email: e.target.value})} disabled={!!editingId} placeholder="usuario@empresa.com.br" className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-4 text-sm text-slate-200 focus:border-cyan-400 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] outline-none transition-all placeholder:text-slate-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Nível de Privilégio (Role)</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                  <select required value={novo.role} onChange={e=>setNovo({...novo, role: e.target.value as any})} className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-10 py-4 text-sm text-slate-200 focus:border-cyan-400 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] outline-none transition-all appearance-none font-medium cursor-pointer">
                    <option value="OPERADOR" className="bg-slate-900">OPERADOR (Acesso Restrito)</option>
                    <option value="MASTER" className="bg-slate-900">MASTER (Administrador)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              
              {novo.role === 'OPERADOR' && (
                <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-5 mt-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Módulos Permitidos</label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {TELAS_SISTEMA.map(t => (
                      <label key={t.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${novo.telas_permitidas?.includes(t.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-[#0A1120] border-white/10 group-hover:border-slate-500'}`}>
                          {novo.telas_permitidas?.includes(t.id) && <CheckCircle2 className="w-3 h-3 text-slate-900" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={novo.telas_permitidas?.includes(t.id) || false} onChange={() => toggleTela(t.id)} />
                        <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">{t.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            </form>
          </div>

          <div className="p-6 border-t border-white/5 bg-white/[0.01]">
            <button form="novoUsuarioForm" type="submit" className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl text-sm shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
              Salvar Perfil <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}