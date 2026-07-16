"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAppStore, Posto } from "@/store";

export default function PostosPage() {
  const { postos, unidades, adicionarPosto } = useAppStore();

  const [novo, setNovo] = useState<Partial<Posto>>({
    unidadeId: "u1", nome: "", escala: "12x36", faturamento: "Mensal",
    temDiurno: true, horaInicioDiurno: "06:00", horaFimDiurno: "18:00", valorDiurno: null,
    temNoturno: false, horaInicioNoturno: "18:00", horaFimNoturno: "06:00", valorNoturno: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Defaulting to "tipo" parameter that exists in original store as 'nome'
    const postoParaSalvar = {
      ...novo, 
      id: `po-${Date.now()}`, 
      prestadoraId: null,
      tipo: novo.nome // mapping nome to tipo since old store used tipo for role
    } as unknown as Posto;
    
    adicionarPosto(postoParaSalvar);
    alert("Posto criado com sucesso! Ele estará disponível na tela de Vínculos.");
    
    // Reset form
    setNovo({
      unidadeId: unidades[0]?.id || "", nome: "", escala: "12x36", faturamento: "Mensal",
      temDiurno: true, horaInicioDiurno: "06:00", horaFimDiurno: "18:00", valorDiurno: null,
      temNoturno: false, horaInicioNoturno: "18:00", horaFimNoturno: "06:00", valorNoturno: null
    });
  };

  return (
    <div className="flex gap-8">
      {/* Formulario */}
      <div className="w-[400px] shrink-0 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-cyan-400" />
          Gerador de Demanda (Postos)
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Unidade / Cliente</label>
            <select value={novo.unidadeId} onChange={e => setNovo({...novo, unidadeId: e.target.value})} className="w-full mt-1 bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-cyan-400 outline-none">
              {unidades.map((u: any) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Posto/Serviço</label>
            <input required type="text" value={novo.nome || ''} onChange={e => setNovo({...novo, nome: e.target.value})} placeholder="Ex: Vigilância Armada" className="w-full mt-1 bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-cyan-400 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Escala</label>
              <select value={novo.escala || ''} onChange={e => setNovo({...novo, escala: e.target.value})} className="w-full mt-1 bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-cyan-400 outline-none">
                <option value="8h">8 Horas</option>
                <option value="12x36">12x36</option>
                <option value="24h">24 Horas</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Faturamento</label>
              <select value={novo.faturamento || ''} onChange={e => setNovo({...novo, faturamento: e.target.value})} className="w-full mt-1 bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-cyan-400 outline-none">
                <option value="Mensal">Mensal</option>
                <option value="Diário">Diário</option>
              </select>
            </div>
          </div>

          <div className="border border-white/5 bg-slate-950/50 rounded-xl p-3 space-y-4">
            {/* Turno Diurno */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={novo.temDiurno} onChange={e => setNovo({...novo, temDiurno: e.target.checked})} className="accent-cyan-400 w-4 h-4" />
                <span className="text-sm font-bold text-white">Turno Diurno</span>
              </label>
              {novo.temDiurno && (
                <div className="grid grid-cols-3 gap-2 pl-6">
                  <input type="time" value={novo.horaInicioDiurno} onChange={e => setNovo({...novo, horaInicioDiurno: e.target.value})} className="bg-slate-900 border border-white/10 rounded p-1.5 text-xs text-white outline-none focus:border-cyan-400" />
                  <input type="time" value={novo.horaFimDiurno} onChange={e => setNovo({...novo, horaFimDiurno: e.target.value})} className="bg-slate-900 border border-white/10 rounded p-1.5 text-xs text-white outline-none focus:border-cyan-400" />
                  <input type="number" placeholder="Valor R$" value={novo.valorDiurno || ''} onChange={e => setNovo({...novo, valorDiurno: Number(e.target.value)})} className="bg-slate-900 border border-cyan-500/30 rounded p-1.5 text-xs text-cyan-400 font-mono outline-none focus:border-cyan-400" required />
                </div>
              )}
            </div>

            <div className="h-px bg-white/5"></div>

            {/* Turno Noturno */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={novo.temNoturno} onChange={e => setNovo({...novo, temNoturno: e.target.checked})} className="accent-blue-500 w-4 h-4" />
                <span className="text-sm font-bold text-white">Turno Noturno</span>
              </label>
              {novo.temNoturno && (
                <div className="grid grid-cols-3 gap-2 pl-6">
                  <input type="time" value={novo.horaInicioNoturno} onChange={e => setNovo({...novo, horaInicioNoturno: e.target.value})} className="bg-slate-900 border border-white/10 rounded p-1.5 text-xs text-white outline-none focus:border-blue-400" />
                  <input type="time" value={novo.horaFimNoturno} onChange={e => setNovo({...novo, horaFimNoturno: e.target.value})} className="bg-slate-900 border border-white/10 rounded p-1.5 text-xs text-white outline-none focus:border-blue-400" />
                  <input type="number" placeholder="Valor R$" value={novo.valorNoturno || ''} onChange={e => setNovo({...novo, valorNoturno: Number(e.target.value)})} className="bg-slate-900 border border-blue-500/30 rounded p-1.5 text-xs text-blue-400 font-mono outline-none focus:border-blue-400" required />
                </div>
              )}
            </div>
          </div>
          
          <button type="submit" className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:scale-[1.02] transition-all">
            Salvar Posto
          </button>
        </form>
      </div>

      {/* Grid de Postos */}
      <div className="flex-1">
        <h2 className="text-lg font-bold text-white mb-6">Postos Cadastrados ({postos.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {postos.map((p: any) => {
            const uni = unidades.find((u: any) => u.id === p.unidadeId);
            const escalaStr = p.escala || p.cargaHoraria || "8h";
            const nomeStr = p.nome || p.tipo || "Posto";
            return (
              <div key={p.id} className="bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-bold">{uni?.nome}</h3>
                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded">{escalaStr}</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{nomeStr}</p>
                <div className="flex flex-col gap-2">
                  {p.temDiurno && (
                    <div className="flex justify-between items-center text-[10px] bg-cyan-950/30 border border-cyan-500/20 px-2 py-1.5 rounded">
                      <span className="text-cyan-400 font-bold">Diurno ({p.horaInicioDiurno}-{p.horaFimDiurno})</span>
                      <span className="font-mono text-cyan-300 font-bold">R$ {p.valorDiurno}</span>
                    </div>
                  )}
                  {p.temNoturno && (
                    <div className="flex justify-between items-center text-[10px] bg-blue-950/30 border border-blue-500/20 px-2 py-1.5 rounded">
                      <span className="text-blue-400 font-bold">Noturno ({p.horaInicioNoturno}-{p.horaFimNoturno})</span>
                      <span className="font-mono text-blue-300 font-bold">R$ {p.valorNoturno}</span>
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
