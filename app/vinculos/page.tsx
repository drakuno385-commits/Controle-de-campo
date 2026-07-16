"use client";

import { Building2, Unlink, ServerCrash } from "lucide-react";
import { useAppStore, Posto } from "@/store";

export default function VinculosPrestadores() {
  const { prestadoras, postos, unidades, vincularPosto } = useAppStore();
  
  const semVinculo = postos.filter(p => p.prestadoraId === null);

  return (
    <div className="flex gap-8 h-full">
      {/* Postos sem vinculo */}
      <div className="w-[350px] shrink-0 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col h-[700px]">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ServerCrash className="w-4 h-4 text-rose-500" />
            Postos Órfãos ({semVinculo.length})
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">Arraste para uma empresa para vincular.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {semVinculo.map((p: any) => {
            const uni = unidades.find((u: any) => u.id === p.unidadeId);
            return (
              <div 
                key={p.id} 
                draggable 
                onDragStart={(e) => e.dataTransfer.setData("postoId", p.id)}
                className="bg-slate-950 border border-white/10 p-4 rounded-xl cursor-grab hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-rose-500 group-hover:bg-cyan-500 transition-colors"></div>
                <div className="pl-2">
                  <h3 className="text-sm font-bold text-white">{uni?.nome}</h3>
                  <p className="text-[11px] text-slate-400 mb-2">{p.nome || p.tipo || 'Posto'}</p>
                  <div className="flex gap-2">
                    {p.temDiurno && <span className="text-[9px] font-bold bg-cyan-950 text-cyan-400 px-2 py-1 rounded">DIA: R${p.valorDiurno}</span>}
                    {p.temNoturno && <span className="text-[9px] font-bold bg-blue-950 text-blue-400 px-2 py-1 rounded">NOITE: R${p.valorNoturno}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prestadoras / Dropzones */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 h-[700px] overflow-y-auto">
        {prestadoras.map((prest: any) => {
          const vinculados = postos.filter((p: any) => p.prestadoraId === prest.id);
          return (
            <div 
              key={prest.id}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const pId = e.dataTransfer.getData("postoId"); if(pId) vincularPosto(pId, prest.id); }}
              className="bg-slate-900/30 border-2 border-dashed border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/10 transition-all rounded-2xl p-6"
            >
              <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-500" /> {prest.nome}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-1">{prest.cnpj}</p>
                </div>
                <div className="bg-slate-950 border border-white/5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400">
                  Total: <span className="text-cyan-400">{vinculados.length}</span>
                </div>
              </div>

              <div className="space-y-3">
                {vinculados.length === 0 && <p className="text-xs text-slate-500 text-center py-8">Arraste postos para cá</p>}
                {vinculados.map((p: any) => {
                  const uni = unidades.find((u: any) => u.id === p.unidadeId);
                  return (
                    <div key={p.id} className="bg-slate-950 border border-white/5 p-3 rounded-lg flex justify-between items-center group">
                      <div>
                        <h4 className="text-xs font-bold text-white">{uni?.nome}</h4>
                        <p className="text-[10px] text-slate-400">{p.nome || p.tipo || 'Posto'}</p>
                      </div>
                      <button onClick={() => vincularPosto(p.id, null!)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded transition-all">
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
