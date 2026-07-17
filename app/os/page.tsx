"use client";

import { Search, Clock, CheckCircle2, XCircle, Briefcase } from "lucide-react";
import { useAppStore, Apontamento } from "@/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OSPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
  }, [router]);
  const { apontamentos, postos, prestadoras, unidades } = useAppStore();
  const formatCurrency = (val: number | null) => val !== null ? `R$ ${val.toFixed(2)}` : '-';

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl h-[750px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-cyan-400" /> Auditoria de Faturamento
        </h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Filtrar técnico..." className="bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-cyan-400 outline-none w-64" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-white/5 bg-slate-950/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-wider">
              <th className="p-4 font-bold border-b border-white/5">Status</th>
              <th className="p-4 font-bold border-b border-white/5">Data</th>
              <th className="p-4 font-bold border-b border-white/5">Técnico</th>
              <th className="p-4 font-bold border-b border-white/5">Local / Posto</th>
              <th className="p-4 font-bold border-b border-white/5">Empresa</th>
              <th className="p-4 font-bold border-b border-white/5 text-right">Faturamento Final</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {apontamentos.map((ap: Apontamento) => {
              const posto = postos.find(p => p.id === ap.postoId);
              const unidade = unidades.find(u => u.id === posto?.unidadeId);
              const empresa = prestadoras.find(pr => pr.id === posto?.prestadoraId);
              
              const d = new Date(ap.checkIn);
              
              return (
                <tr key={ap.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    {ap.status === 'Em Andamento' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3"/> Em Andamento</span>}
                    {ap.status === 'Faturado' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3"/> Faturado</span>}
                    {ap.status === 'Falta' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><XCircle className="w-3 h-3"/> Falta (Glosa)</span>}
                  </td>
                  <td className="p-4 text-slate-300 font-mono text-xs">{d.toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 text-white font-medium">{ap.tecnico}</td>
                  <td className="p-4">
                    <p className="text-white text-xs">{unidade?.nome}</p>
                    <p className="text-slate-500 text-[10px]">{(posto as any)?.nome || posto?.tipo}</p>
                  </td>
                  <td className="p-4 text-slate-400 text-xs">{empresa?.nome || '-'}</td>
                  <td className="p-4 text-right">
                    {ap.status === 'Em Andamento' ? (
                      <span className="text-slate-600 text-xs">-</span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className={`font-mono font-bold text-sm ${ap.status === 'Falta' ? 'text-rose-500' : 'text-emerald-400'}`}>
                          {formatCurrency(ap.valorFaturado)}
                        </span>
                        {ap.descontoCalculado > 0 && (
                          <div className="flex flex-col items-end mt-1">
                            <span className="text-[10px] text-slate-500 line-through decoration-rose-500">
                              {formatCurrency(ap.valorOriginal)}
                            </span>
                            <span className="text-[9px] text-rose-400 bg-rose-500/10 px-1.5 rounded mt-0.5">
                              {ap.falta ? "Falta Integral" : `Atraso: ${ap.atrasoMinutos}m`} (-{formatCurrency(ap.descontoCalculado)})
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {apontamentos.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">Nenhuma OS encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
