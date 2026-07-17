import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Clock, Plus, Link2, Unlink, Search, 
  CheckCircle2, XCircle, Smartphone, LayoutDashboard, Users, GripVertical, Info, FileText, BarChart3, Download, Camera, AlertTriangle, ChevronDown, Briefcase
} from 'lucide-react';
import { Posto, Apontamento, Prestadora, Servico, Escala, Perfil } from '../../types';
import { formatMoney } from '../../utils/formatters';

export default function TabPostos({ postos, servicos, escalas, onSave }: any) {
  const defaults = {
    nome: "", escalaId: escalas[0]?.id || "", servicosIds: [] as string[], faturamento: "Mensal" as any,
    temDiurno: true, horaInicioDiurno: "06:00", horaFimDiurno: "18:00", valorDiurno: null, qtdDiurno: 1,
    temNoturno: false, horaInicioNoturno: "18:00", horaFimNoturno: "06:00", valorNoturno: null, qtdNoturno: 1
  };
  const [novo, setNovo] = useState<Partial<Posto>>(defaults);
  const [editingId, setEditingId] = useState<string | null>(null);

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
  };

  const cancelEdit = () => {
    setNovo(defaults);
    setEditingId(null);
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
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full fade-in">
      <div className="w-full xl:w-[420px] shrink-0 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl h-fit">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" /> {editingId ? "Editar Posto" : "Novo Posto"}
          </h2>
          {editingId && <button type="button" onClick={cancelEdit} className="text-xs text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 px-2 py-1 rounded-md">Cancelar</button>}
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Nome do Serviço / Local</label>
            <input required type="text" value={novo.nome} onChange={e=>setNovo({...novo, nome: e.target.value})} placeholder="Ex: Portaria Norte" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-cyan-400/50 outline-none transition-colors" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Escala Padrão</label>
              <select required value={novo.escalaId || ""} onChange={e=>setNovo({...novo, escalaId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none appearance-none focus:border-cyan-400">
                <option value="" disabled>Selecione a Escala...</option>
                {escalas.map((e:any) => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Faturamento</label>
              <select value={novo.faturamento} onChange={e=>setNovo({...novo, faturamento: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 outline-none appearance-none focus:border-cyan-400">
                <option value="Mensal">Mensal</option>
                <option value="Diário">Diário</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">Serviços Executados</label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-950 border border-slate-800 rounded-xl max-h-[140px] overflow-y-auto">
              {servicos.length === 0 && <span className="text-slate-500 text-xs">Crie serviços no Catálogo primeiro.</span>}
              {servicos.map((s:any) => (
                <label key={s.id} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer border transition-colors ${novo.servicosIds?.includes(s.id) ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}>
                  <input type="checkbox" className="hidden" checked={novo.servicosIds?.includes(s.id) || false} onChange={() => toggleServico(s.id)} />
                  <span className="text-xs font-semibold">{s.nome}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <ShiftPanel title="Turno Diurno" active={novo.temDiurno!} toggle={() => setNovo({...novo, temDiurno: !novo.temDiurno})} hI={novo.horaInicioDiurno!} setHi={(v: any) => setNovo({...novo, horaInicioDiurno: v})} hF={novo.horaFimDiurno!} setHf={(v: any) => setNovo({...novo, horaFimDiurno: v})} val={novo.valorDiurno} setVal={(v: any) => setNovo({...novo, valorDiurno: v})} color="cyan" qtd={novo.qtdDiurno} setQtd={(v: any) => setNovo({...novo, qtdDiurno: v})} />
            <ShiftPanel title="Turno Noturno" active={novo.temNoturno!} toggle={() => setNovo({...novo, temNoturno: !novo.temNoturno})} hI={novo.horaInicioNoturno!} setHi={(v: any) => setNovo({...novo, horaInicioNoturno: v})} hF={novo.horaFimNoturno!} setHf={(v: any) => setNovo({...novo, horaFimNoturno: v})} val={novo.valorNoturno} setVal={(v: any) => setNovo({...novo, valorNoturno: v})} color="blue" qtd={novo.qtdNoturno} setQtd={(v: any) => setNovo({...novo, qtdNoturno: v})} />
          </div>
          
          <button type="submit" className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl text-sm shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] hover:-translate-y-0.5 active:translate-y-0 transition-all">
            {editingId ? "Salvar Alterações" : "Criar Posto"}
          </button>
        </form>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-6">
          {postos.length === 0 && <p className="text-slate-500 col-span-full">Nenhum posto cadastrado.</p>}
          {postos.map((p: Posto) => {
            const esc = escalas.find((e:any) => e.id === p.escalaId)?.nome || 'Sem Escala';
            return (
              <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:border-cyan-500/30 hover:bg-white/[0.04] hover:-translate-y-1 transition-all duration-300 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-slate-100 font-bold tracking-tight text-base leading-tight flex-1 pr-2">
                    <span className="text-slate-500 text-xs mr-2 font-mono">#{p.codigoSequencial || '---'}</span>
                    {p.nome}
                  </h3>
                  <div className="flex items-center gap-2">
                    {p.prestadoraId === null && (
                      <button onClick={() => startEdit(p)} className="text-cyan-400 hover:text-cyan-300 p-1.5 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Editar Posto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      </button>
                    )}
                    <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0">{esc} | {p.faturamento}</span>
                  </div>
                </div>
                
                {p.servicosIds && p.servicosIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {p.servicosIds.map(sid => {
                      const sn = servicos.find((s:any)=>s.id === sid)?.nome;
                      return sn ? <span key={sid} className="text-[10px] font-bold text-slate-400 border border-slate-800 rounded px-2 py-0.5">{sn}</span> : null;
                    })}
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-800/50">
                  {p.temDiurno && (
                    <div className="flex justify-between items-center text-sm bg-cyan-950/20 border border-cyan-500/10 px-4 py-3 rounded-xl shadow-inner relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/50" />
                      <span className="text-cyan-400/80 font-bold flex items-center gap-2"><Clock className="w-4 h-4"/> {p.horaInicioDiurno}-{p.horaFimDiurno}</span>
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-cyan-400 font-bold">{formatMoney(p.valorDiurno)}</span>
                        <span className="text-[10px] text-cyan-500/60 font-bold uppercase">{p.qtdDiurno}x Efetivo</span>
                      </div>
                    </div>
                  )}
                  {p.temNoturno && (
                    <div className="flex justify-between items-center text-sm bg-blue-950/20 border border-blue-500/10 px-4 py-3 rounded-xl shadow-inner relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50" />
                      <span className="text-blue-400/80 font-bold flex items-center gap-2"><Clock className="w-4 h-4"/> {p.horaInicioNoturno}-{p.horaFimNoturno}</span>
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-blue-400 font-bold">{formatMoney(p.valorNoturno ?? 0)}</span>
                        <span className="text-[10px] text-blue-500/60 font-bold uppercase">{p.qtdNoturno}x Efetivo</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ShiftPanel({ title, active, toggle, hI, setHi, hF, setHf, val, setVal, color, qtd, setQtd }: any) {
  const theme = color === 'cyan' ? 'accent-cyan-400 text-cyan-400' : 'accent-blue-500 text-blue-400';
  return (
    <div className={`bg-slate-950/50 border border-slate-800 rounded-xl p-3 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
      <div className="flex items-center gap-3 mb-3 cursor-pointer pointer-events-auto" onClick={toggle}>
        <div className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 flex items-center shadow-inner ${active ? (color==='cyan'?'bg-cyan-500':'bg-blue-500') : 'bg-slate-700'}`}>
          <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm font-semibold text-slate-200">{title}</span>
      </div>
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 transition-opacity duration-500`}>
        <div className="relative group">
          <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
          <input type="time" title="Hora de Início" value={hI} onChange={e=>setHi(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-300 outline-none focus:border-slate-600 font-mono transition-colors" />
        </div>
        <div className="relative group">
          <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
          <input type="time" title="Hora de Fim" value={hF} onChange={e=>setHf(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-2 text-xs text-slate-300 outline-none focus:border-slate-600 font-mono transition-colors" />
        </div>
        <div className="relative group">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 group-focus-within:text-slate-400 transition-colors">R$</span>
          <input type="number" title="Valor Base Unitário" value={val||''} onChange={e=>setVal(Number(e.target.value))} className={`w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-2 py-2 text-xs font-mono font-bold outline-none ${theme} focus:border-${color}-500/50 transition-colors`} placeholder="Valor" />
        </div>
        <div className="relative group">
          <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
          <input type="number" min="1" title="Quantidade de Funcionários" value={qtd||1} onChange={e=>setQtd(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-2 text-xs font-bold text-slate-200 outline-none focus:border-slate-600 transition-colors" placeholder="Qtd" />
        </div>
      </div>
    </div>
  );
}