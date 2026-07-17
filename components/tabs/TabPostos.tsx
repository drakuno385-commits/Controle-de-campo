import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Clock, Plus, Link2, Unlink, Search, 
  CheckCircle2, XCircle, Smartphone, LayoutDashboard, Users, GripVertical, Info, FileText, BarChart3, Download, Camera, AlertTriangle, ChevronDown, Briefcase, Calendar, X, ChevronRight
} from 'lucide-react';
import { Posto, Apontamento, Prestadora, Servico, Escala, Perfil } from '../../types';
import { formatMoney } from '../../utils/formatters';

export default function TabPostos({ postos, servicos, escalas, prestadoras, onSave }: any) {
  const defaults = {
    nome: "", escalaId: escalas[0]?.id || "", servicosIds: [] as string[], faturamento: "Mensal" as any,
    temDiurno: true, horaInicioDiurno: "06:00", horaFimDiurno: "18:00", valorDiurno: null, qtdDiurno: 1,
    temNoturno: false, horaInicioNoturno: "18:00", horaFimNoturno: "06:00", valorNoturno: null, qtdNoturno: 1
  };
  const [novo, setNovo] = useState<Partial<Posto>>(defaults);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!novo.escalaId && escalas.length > 0 && !editingId) setNovo(n => ({...n, escalaId: escalas[0].id}));
  }, [escalas, editingId]);

  const toggleServico = (id: string) => {
    setNovo(n => {
      const ids = n.servicosIds || [];
      if (ids.includes(id)) return { ...n, servicosIds: ids.filter(x => x !== id) };
      return { ...n, servicosIds: [...ids, id] };
    });
  };

  const startEdit = (p: Posto) => {
    setNovo(p);
    setEditingId(p.id);
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
      onSave(novo as Posto);
      setEditingId(null);
    } else {
      onSave({ ...novo, id: `po-${Date.now()}`, prestadoraId: null } as Posto);
    }
    setNovo(defaults);
    setDrawerOpen(false);
  };

  return (
    <div className="h-full flex flex-col relative fade-in">
      
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Gestão de Postos Operacionais
          </h2>
          <p className="text-sm text-slate-500 mt-1">Gerencie os locais de atendimento, valores contratuais e escalas.</p>
        </div>
        <button 
          onClick={() => setDrawerOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Novo Posto
        </button>
      </div>

      {/* MAIN GRID FULL WIDTH */}
      <div className="flex-1 overflow-y-auto pr-2 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {postos.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
              <MapPin className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400 font-medium text-lg">Nenhum posto cadastrado</p>
              <p className="text-slate-500 text-sm mt-1">Clique no botão "Novo Posto" no topo para começar.</p>
            </div>
          )}
          {postos.map((p: Posto) => {
            const vinculada = prestadoras?.find((emp: Prestadora) => emp.id === p.prestadoraId);
            const esc = escalas.find((e:any) => e.id === p.escalaId)?.nome || 'Sem Escala';
            return (
              <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-300 backdrop-blur-2xl group shadow-lg flex flex-col gap-4 relative">
                <button onClick={() => startEdit(p)} className="absolute top-3 right-3 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-10" title="Editar Posto">
                  <LayoutDashboard className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-950/40 border border-white/5 rounded-xl flex items-center justify-center group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all shrink-0">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="text-slate-100 font-bold tracking-tight text-sm mb-1 truncate">{p.nome}</h3>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{esc}</span>
                      {vinculada ? 
                        <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 flex items-center gap-1 truncate max-w-[120px]"><Link2 className="w-2.5 h-2.5 shrink-0"/> {vinculada.nome}</span> :
                        <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-rose-950 text-rose-400">Sem Vínculo</span>
                      }
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mt-auto">
                  {p.temDiurno && (
                    <div className="flex justify-between items-center bg-[#0A1120]/60 border border-white/5 px-3 py-2 rounded-lg relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/50" />
                      <span className="text-[11px] text-cyan-400/80 font-bold flex items-center gap-1.5"><Clock className="w-3 h-3"/> {p.horaInicioDiurno}-{p.horaFimDiurno}</span>
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-[11px] text-cyan-400 font-bold">{formatMoney(p.valorDiurno ?? 0)}</span>
                      </div>
                    </div>
                  )}
                  {p.temNoturno && (
                    <div className="flex justify-between items-center bg-[#0A1120]/60 border border-white/5 px-3 py-2 rounded-lg relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50" />
                      <span className="text-[11px] text-blue-400/80 font-bold flex items-center gap-1.5"><Clock className="w-3 h-3"/> {p.horaInicioNoturno}-{p.horaFimNoturno}</span>
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-[11px] text-blue-400 font-bold">{formatMoney(p.valorNoturno ?? 0)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SLIDE-OVER DRAWER (GAVETA DE CADASTRO) */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={cancelEdit} />
        
        <div className={`relative w-[540px] bg-[#0A1120] border-l border-white/10 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02] shrink-0">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              <Plus className="w-5 h-5 text-cyan-400" /> {editingId ? "Editar Posto" : "Cadastrar Posto"}
            </h2>
            <button onClick={cancelEdit} className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <form id="novoPostoForm" onSubmit={onSubmit} className="flex flex-col gap-6">
              
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Identificação do Posto</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                  <input required type="text" value={novo.nome} onChange={e=>setNovo({...novo, nome: e.target.value})} placeholder="Ex: Hospital Municipal - Portaria" className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-slate-200 focus:border-cyan-400 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] outline-none transition-all placeholder:text-slate-600 font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Regra de Faturamento</label>
                  <div className="relative">
                    <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                    <select required value={novo.faturamento} onChange={e=>setNovo({...novo, faturamento: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-10 py-4 text-sm text-slate-200 focus:border-cyan-400 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] outline-none transition-all appearance-none font-medium cursor-pointer">
                      <option value="Mensal" className="bg-slate-900">Mensal Fixo</option>
                      <option value="Diário" className="bg-slate-900">Diário por Evento</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Escala Operacional</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                    <select required value={novo.escalaId||''} onChange={e=>setNovo({...novo, escalaId: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-10 py-4 text-sm text-slate-200 focus:border-cyan-400 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] outline-none transition-all appearance-none font-medium cursor-pointer">
                      {escalas.map((e: Escala) => <option key={e.id} value={e.id} className="bg-slate-900">{e.nome}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Serviços Exigidos</label>
                <div className="flex flex-wrap gap-2">
                  {servicos.length === 0 && <span className="text-slate-600 text-xs italic">Nenhum catálogo de serviço criado.</span>}
                  {servicos.map((s: Servico) => {
                    const active = novo.servicosIds?.includes(s.id);
                    return (
                      <button type="button" key={s.id} onClick={() => toggleServico(s.id)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${active ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}>
                        {s.nome}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-white/10 my-4" />
              
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Turnos e Valores</label>
              <div className="space-y-4">
                <ShiftPanel title="Turno Diurno" active={novo.temDiurno} toggle={()=>setNovo({...novo, temDiurno: !novo.temDiurno})} hI={novo.horaInicioDiurno} setHi={(v:any)=>setNovo({...novo, horaInicioDiurno: v})} hF={novo.horaFimDiurno} setHf={(v:any)=>setNovo({...novo, horaFimDiurno: v})} val={novo.valorDiurno} setVal={(v:any)=>setNovo({...novo, valorDiurno: v})} color="cyan" qtd={novo.qtdDiurno} setQtd={(v:any)=>setNovo({...novo, qtdDiurno:v})} />
                
                <ShiftPanel title="Turno Noturno" active={novo.temNoturno} toggle={()=>setNovo({...novo, temNoturno: !novo.temNoturno})} hI={novo.horaInicioNoturno} setHi={(v:any)=>setNovo({...novo, horaInicioNoturno: v})} hF={novo.horaFimNoturno} setHf={(v:any)=>setNovo({...novo, horaFimNoturno: v})} val={novo.valorNoturno} setVal={(v:any)=>setNovo({...novo, valorNoturno: v})} color="blue" qtd={novo.qtdNoturno} setQtd={(v:any)=>setNovo({...novo, qtdNoturno:v})} />
              </div>
              
            </form>
          </div>

          <div className="p-6 border-t border-white/5 bg-white/[0.01] shrink-0">
            <button form="novoPostoForm" type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-xl text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
              Salvar Registro <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export function ShiftPanel({ title, active, toggle, hI, setHi, hF, setHf, val, setVal, color, qtd, setQtd }: any) {
  const theme = color === 'cyan' ? 'accent-cyan-400 text-cyan-400' : 'accent-blue-500 text-blue-400';
  return (
    <div className={`bg-[#0A1120] border border-white/10 rounded-xl p-4 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
      <div className="flex items-center gap-3 mb-4 cursor-pointer pointer-events-auto" onClick={toggle}>
        <div className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 flex items-center shadow-inner ${active ? (color==='cyan'?'bg-cyan-500':'bg-blue-500') : 'bg-slate-800'}`}>
          <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm font-semibold text-slate-200">{title}</span>
      </div>
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 transition-opacity duration-500`}>
        <div className="relative group">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
          <input type="time" title="Hora de Início" value={hI} onChange={e=>setHi(e.target.value)} className="w-full bg-white/[0.02] border border-white/10 rounded-lg pl-9 pr-2 py-2 text-sm text-slate-300 outline-none focus:border-slate-500 font-mono transition-colors" />
        </div>
        <div className="relative group">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
          <input type="time" title="Hora de Fim" value={hF} onChange={e=>setHf(e.target.value)} className="w-full bg-white/[0.02] border border-white/10 rounded-lg pl-9 pr-2 py-2 text-sm text-slate-300 outline-none focus:border-slate-500 font-mono transition-colors" />
        </div>
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 group-focus-within:text-slate-400 transition-colors">R$</span>
          <input type="number" title="Valor Base Unitário" value={val||''} onChange={e=>setVal(Number(e.target.value))} className={`w-full bg-white/[0.02] border border-white/10 rounded-lg pl-8 pr-2 py-2 text-sm font-mono font-bold outline-none ${theme} focus:border-${color}-500/50 transition-colors`} placeholder="Valor" />
        </div>
        <div className="relative group">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
          <input type="number" min="1" title="Quantidade de Funcionários" value={qtd||1} onChange={e=>setQtd(Number(e.target.value))} className="w-full bg-white/[0.02] border border-white/10 rounded-lg pl-9 pr-2 py-2 text-sm font-bold text-slate-200 outline-none focus:border-slate-500 transition-colors" placeholder="Qtd" />
        </div>
      </div>
    </div>
  );
}