import React, { useState } from 'react';
import { 
  Users, CheckCircle2, Plus, X, ChevronRight, Shield, ChevronDown, Search, 
  LayoutDashboard, KeyRound, RefreshCw, AlertTriangle, UserCheck, Trash2, Mail
} from 'lucide-react';
import { Perfil } from '../../types';

export default function TabUsuarios({ perfis, onSave, onDelete, onResetSenha, currentUser }: any) {
  const defaults: Partial<Perfil> = { nome: "", email: "", role: "OPERADOR", telas_permitidas: [], must_change_password: true };
  const [novo, setNovo] = useState<Partial<Perfil>>(defaults);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [resetandoId, setResetandoId] = useState<string | null>(null);

  const isMaster = currentUser?.role === 'MASTER';

  const perfisFiltrados = perfis.filter((p: Perfil) => 
    p.email.toLowerCase().includes(busca.toLowerCase()) ||
    (p.nome || '').toLowerCase().includes(busca.toLowerCase())
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
    if (editingId) {
      onSave(novo as Perfil);
    } else {
      // Novo usuário: senha inicial GWEP@123, must_change_password = true
      onSave({ ...novo, must_change_password: true } as Perfil);
    }
    setNovo(defaults);
    setEditingId(null);
    setDrawerOpen(false);
  };

  const handleReset = async (p: Perfil) => {
    if (!confirm(`Tem certeza que deseja resetar a senha de ${p.nome || p.email} para a senha inicial GWEP@123?\n\nO usuário será obrigado a cadastrar nova senha no próximo acesso.`)) return;
    setResetandoId(p.id!);
    await onResetSenha(p);
    setResetandoId(null);
  };

  const getInitials = (p: Perfil) => {
    if (p.nome) return p.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return p.email.charAt(0).toUpperCase();
  };

  return (
    <div className="h-full flex flex-col relative fade-in">
      
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Controle de Usuários
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Novos usuários recebem a senha inicial <code className="text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded text-xs font-mono">GWEP@123</code> e são obrigados a alterá-la no primeiro acesso.
          </p>
        </div>
        {isMaster && (
          <button 
            onClick={() => setDrawerOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="flex gap-4 mb-5 shrink-0">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
            placeholder="Buscar por nome ou e-mail..." 
            className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500/50 outline-none transition-colors"
          />
        </div>
      </div>

      {/* MAIN LIST */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 custom-scrollbar">
        <div className="bg-[#0A1120]/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[30%]">Usuário</th>
                <th className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[10%]">Nível</th>
                <th className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[10%]">Status</th>
                <th className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[38%]">Módulos</th>
                <th className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[12%] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {perfisFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">Nenhum perfil encontrado.</p>
                  </td>
                </tr>
              )}
              {perfisFiltrados.map((p: Perfil) => (
                <tr key={p.id} className="hover:bg-white/[0.02] group transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-inner border shrink-0 ${p.role === 'MASTER' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-[#0A1120]/80 text-slate-300 border-white/5'}`}>
                        {getInitials(p)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">{p.nome || '—'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded ${p.role === 'MASTER' ? 'bg-cyan-950/50 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {p.must_change_password ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                        <KeyRound className="w-2.5 h-2.5" /> Senha Temp.
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <UserCheck className="w-2.5 h-2.5" /> Ativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {p.role === 'MASTER' ? (
                      <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-cyan-950/30 text-cyan-500/80 flex items-center gap-1 w-fit">
                        <Shield className="w-2.5 h-2.5"/> Acesso Irrestrito Total
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {p.telas_permitidas.length === 0 && <span className="text-xs text-rose-400 font-medium">Nenhum acesso</span>}
                        {p.telas_permitidas.map(t => {
                          const tName = TELAS_SISTEMA.find(s => s.id === t)?.nome || t;
                          return <span key={t} className="text-[8px] font-bold uppercase tracking-widest bg-[#0A1120]/60 text-slate-400 border border-white/5 px-1.5 py-0.5 rounded whitespace-nowrap">{tName}</span>;
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {isMaster && (
                        <button 
                          onClick={() => handleReset(p)} 
                          disabled={resetandoId === p.id}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-amber-400 transition-colors disabled:opacity-40" 
                          title="Resetar Senha para GWEP@123"
                        >
                          {resetandoId === p.id 
                            ? <RefreshCw className="w-4 h-4 animate-spin" />
                            : <KeyRound className="w-4 h-4" />
                          }
                        </button>
                      )}
                      {isMaster && (
                        <button 
                          onClick={() => startEdit(p)} 
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-cyan-400 transition-colors" 
                          title="Editar"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                        </button>
                      )}
                      {isMaster && onDelete && (
                        <button 
                          onClick={() => onDelete(p.id)} 
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-rose-400 transition-colors" 
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLIDE-OVER DRAWER */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={cancelEdit} />
        
        <div className={`relative w-[480px] bg-[#0A1120] border-l border-white/10 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              <Users className="w-5 h-5 text-cyan-400" /> {editingId ? "Editar Perfil" : "Convidar Usuário"}
            </h2>
            <button onClick={cancelEdit} className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!editingId && (
            <div className="mx-6 mt-5 flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                A senha inicial será <strong className="text-amber-300 font-mono">GWEP@123</strong>. O usuário será obrigado a criar uma senha pessoal no primeiro acesso ao sistema.
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            <form id="novoUsuarioForm" onSubmit={onSubmit} className="flex flex-col gap-5">
              
              {/* NOME */}
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Nome Completo</label>
                <input 
                  required 
                  type="text" 
                  value={novo.nome || ''} 
                  onChange={e => setNovo({...novo, nome: e.target.value})} 
                  placeholder="Ex: João da Silva" 
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:border-cyan-400 focus:bg-white/[0.05] outline-none transition-all placeholder:text-slate-600 font-medium" 
                />
              </div>

              {/* EMAIL */}
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    required 
                    type="email" 
                    value={novo.email || ''} 
                    onChange={e => setNovo({...novo, email: e.target.value})} 
                    disabled={!!editingId} 
                    placeholder="usuario@empresa.com.br" 
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-200 focus:border-cyan-400 focus:bg-white/[0.05] outline-none transition-all placeholder:text-slate-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed" 
                  />
                </div>
              </div>

              {/* ROLE */}
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Nível de Privilégio</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <select 
                    required 
                    value={novo.role} 
                    onChange={e => setNovo({...novo, role: e.target.value as any})} 
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-11 pr-10 py-3.5 text-sm text-slate-200 focus:border-cyan-400 outline-none transition-all appearance-none font-medium cursor-pointer"
                  >
                    <option value="OPERADOR" className="bg-slate-900">OPERADOR (Acesso Restrito)</option>
                    <option value="MASTER" className="bg-slate-900">MASTER (Administrador)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              
              {/* MÓDULOS */}
              {novo.role === 'OPERADOR' && (
                <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Módulos Permitidos</label>
                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                    {TELAS_SISTEMA.map(t => (
                      <label key={t.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${novo.telas_permitidas?.includes(t.id) ? 'bg-cyan-500 border-cyan-500' : 'bg-[#0A1120] border-white/10 group-hover:border-slate-500'}`}>
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
            <button form="novoUsuarioForm" type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3.5 rounded-xl text-sm shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
              {editingId ? "Salvar Alterações" : "Criar Usuário"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}