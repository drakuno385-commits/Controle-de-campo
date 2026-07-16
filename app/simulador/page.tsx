"use client";

import { useState } from "react";
import { Users, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store";

export default function SimuladorPage() {
  const { postos, unidades, apontamentos, registrarCheckIn, registrarCheckOut, registrarFalta } = useAppStore();
  
  const [tecnico, setTecnico] = useState("Técnico Simulado");
  const [postoId, setPostoId] = useState("");
  // Hora simulada para testar atrasos
  const [simDate, setSimDate] = useState(() => {
    const d = new Date();
    d.setSeconds(0); d.setMilliseconds(0);
    return d;
  });

  const postosValidos = postos.filter(p => p.prestadoraId !== null);
  const ativo = apontamentos.find(a => a.tecnico === tecnico && a.checkOut === null && !a.falta);

  const addMinutes = (m: number) => {
    setSimDate(prev => new Date(prev.getTime() + m * 60000));
  };

  const onCheckIn = () => {
    const todayStr = simDate.toISOString().substring(0, 10);
    const hasToday = apontamentos.find(a => a.tecnico === tecnico && a.postoId === postoId && a.checkIn.startsWith(todayStr));
    if (hasToday) {
      alert("Técnico já completou um turno ou tem falta registrada hoje para este posto!");
      return;
    }
    
    registrarCheckIn({
      id: `ap-${Date.now()}`,
      postoId,
      tecnico,
      checkIn: simDate.toISOString(),
      falta: false,
      atrasoMinutos: 0
    });
  };

  const onFalta = () => {
    registrarFalta(postoId, tecnico, simDate.toISOString());
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Dev Tools for time manipulation */}
      <div className="mb-6 bg-slate-900 border border-white/10 rounded-xl p-4 flex gap-4 items-center">
        <span className="text-xs font-bold text-slate-400 uppercase">Relógio do Simulador:</span>
        <span className="font-mono text-cyan-400 bg-slate-950 px-3 py-1 rounded-lg font-bold border border-cyan-500/20">
          {simDate.toLocaleString('pt-BR')}
        </span>
        <div className="flex gap-2">
          <button onClick={() => addMinutes(-60)} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded">-1h</button>
          <button onClick={() => addMinutes(15)} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded">+15m</button>
          <button onClick={() => addMinutes(60)} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded">+1h</button>
        </div>
      </div>

      {/* Mock Celular */}
      <div className="w-[360px] h-[700px] bg-slate-950 rounded-[40px] border-[8px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col">
        {/* StatusBar */}
        <div className="h-6 flex justify-between items-center px-6 text-[10px] font-bold text-white/50 pt-2 shrink-0">
          <span>{simDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
          <div className="flex gap-1.5"><div className="w-4 h-2.5 bg-white/50 rounded-sm"></div></div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-8 mt-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Bem-vindo,</p>
              <input value={tecnico} onChange={e=>setTecnico(e.target.value)} className="bg-transparent text-white font-bold text-sm border-b border-dashed border-white/20 outline-none w-full" />
            </div>
          </div>

          {!ativo ? (
            // TELA DE CHECK-IN
            <div className="flex flex-col flex-1">
              <h2 className="text-lg font-black text-white mb-4">Iniciar Expediente</h2>
              
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-2">Selecione seu Posto</label>
              <select value={postoId} onChange={e=>setPostoId(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white mb-6 outline-none focus:border-cyan-400">
                <option value="">Selecione...</option>
                {postosValidos.map((p: any) => (
                  <option key={p.id} value={p.id}>{unidades.find((u:any)=>u.id===p.unidadeId)?.nome} - {p.nome || p.tipo}</option>
                ))}
              </select>

              <div className="mt-auto flex flex-col gap-4">
                <button 
                  onClick={onCheckIn}
                  disabled={!postoId}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-slate-900 font-black text-lg disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_25px_rgba(52,211,153,0.3)] active:scale-95"
                >
                  BATER PONTO
                </button>
                <button 
                  onClick={onFalta}
                  disabled={!postoId}
                  className="w-full py-3 rounded-2xl border border-rose-500/30 text-rose-400 font-bold text-sm disabled:opacity-50 hover:bg-rose-500/10 transition-all active:scale-95"
                >
                  Informar Falta / Ausência
                </button>
              </div>
            </div>
          ) : (
            // TELA DE CHECK-OUT
            <div className="flex flex-col flex-1 items-center">
              <div className="mt-8 mb-6 relative">
                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="w-32 h-32 rounded-full border-4 border-cyan-400/30 flex items-center justify-center relative">
                  <div className="text-center">
                    <span className="block text-3xl font-black text-cyan-400 font-mono">
                      {simDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 block">Em andamento</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-xl w-full p-4 mb-auto text-center">
                <p className="text-xs text-slate-400">Posto Atual</p>
                <p className="text-sm font-bold text-white mt-1">{unidades.find((u:any) => u.id === postos.find((p:any) => p.id === ativo.postoId)?.unidadeId)?.nome}</p>
                <p className="text-[10px] text-slate-500 mt-1">{postos.find((p:any) => p.id === ativo.postoId)?.nome || postos.find((p:any) => p.id === ativo.postoId)?.tipo}</p>
                {ativo.atrasoMinutos > 0 && (
                  <div className="mt-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" /> Turno iniciado com {ativo.atrasoMinutos} min de atraso.
                  </div>
                )}
              </div>

              <button 
                onClick={() => registrarCheckOut(ativo.id)} // O atraso manual nao é mais injetado aqui
                className="w-full py-4 mt-8 mb-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-lg transition-all shadow-[0_0_25px_rgba(239,68,68,0.4)] active:scale-95"
              >
                SAÍDA (CHECK-OUT)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
