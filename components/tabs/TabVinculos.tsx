import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Clock, Plus, Link2, Unlink, Search, 
  CheckCircle2, XCircle, Smartphone, LayoutDashboard, Users, GripVertical, Info, FileText, BarChart3, Download, Camera, AlertTriangle, ChevronDown, Briefcase
} from 'lucide-react';
import { Posto, Apontamento, Prestadora, Servico, Escala, Perfil } from '../../types';
import { formatMoney } from '../../utils/formatters';

// Removed duplicate AlertTriangle
function ServerCrash(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h12"/><path d="M6 14h12"/><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><path d="M12 10v4"/></svg>;
}

export default function TabVinculos({ postos, prestadoras, onVincular, isDragging, setIsDragging }: any) {
  const [modalAcao, setModalAcao] = useState<{ postoId: string; empresaId: string | null; tipo: 'Vincular' | 'Desvincular' } | null>(null);
  const [dataAcao, setDataAcao] = useState(() => new Date().toISOString().substring(0, 10));

  const semVinculo = postos.filter((p: Posto) => p.prestadoraId === null);

  const confirmarAcao = () => {
    if (!modalAcao || !dataAcao) return;
    onVincular(modalAcao.postoId, modalAcao.empresaId, dataAcao);
    setModalAcao(null);
  };
  
  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full min-h-[700px] fade-in">
      <div className="w-full xl:w-[420px] shrink-0 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-slate-950/40">
          <h2 className="text-base font-bold text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <ServerCrash className="w-5 h-5 text-rose-400" /> Pendências ({semVinculo.length})
          </h2>
          <p className="text-sm text-slate-400 mt-2">Arraste os postos abaixo para vinculá-los.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {semVinculo.length === 0 && <p className="text-slate-500 text-sm text-center py-10">Não há postos pendentes de vínculo.</p>}
          {semVinculo.map((p: Posto) => {
            return (
              <div 
                key={p.id} draggable 
                onDragStart={(e) => { e.dataTransfer.setData("postoId", p.id); setIsDragging(true); }}
                onDragEnd={() => setIsDragging(false)}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl cursor-grab active:cursor-grabbing p-5 relative group flex items-center gap-4 border-l-[4px] border-l-rose-500/80 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-slate-700 transition-all"
              >
                <GripVertical className="w-6 h-6 text-slate-600 group-hover:text-cyan-500 shrink-0 transition-colors" />
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-200 leading-tight mb-3">{p.nome}</h3>
                  <div className="flex gap-2 font-mono">
                    {p.temDiurno && <span className="text-xs font-semibold bg-cyan-950/30 text-cyan-400 px-3 py-1.5 rounded-lg border border-cyan-500/10">R${p.valorDiurno} (D)</span>}
                    {p.temNoturno && <span className="text-xs font-semibold bg-blue-950/30 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/10">R${p.valorNoturno} (N)</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 overflow-y-auto pr-2">
        {prestadoras.map((prest: Prestadora) => {
          const vinculados = postos.filter((p: Posto) => p.prestadoraId === prest.id);
          return (
            <div 
              key={prest.id}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const pId = e.dataTransfer.getData("postoId"); if(pId) setModalAcao({ postoId: pId, empresaId: prest.id, tipo: 'Vincular' }); }}
              className={`bg-slate-900/50 backdrop-blur-md border-2 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col ${isDragging ? 'border-dashed border-cyan-500/50 animate-pulse bg-cyan-950/20 shadow-[0_0_30px_rgba(0,243,255,0.1)]' : 'border-slate-800/80 hover:border-slate-700 hover:-translate-y-1'}`}
            >
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-slate-500" /> {prest.nome}
                  </h3>
                  <p className="text-sm font-mono text-slate-500 mt-2">{prest.cnpj}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 shadow-inner">
                  Vagas: <span className="text-cyan-400 text-base ml-1">{vinculados.length}</span>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                {vinculados.length === 0 && <p className="text-sm text-slate-600 text-center py-12">Arraste cartões para cá.</p>}
                {vinculados.map((p: Posto) => (
                  <div key={p.id} className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl flex justify-between items-center group hover:bg-slate-900 transition-colors shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{p.nome}</h4>
                    </div>
                    <button onClick={() => setModalAcao({ postoId: p.id, empresaId: null, tipo: 'Desvincular' })} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-all" title="Desvincular">
                      <Unlink className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {modalAcao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              {modalAcao.tipo === 'Vincular' ? 'Data de Implantação' : 'Data de Encerramento'}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {modalAcao.tipo === 'Vincular' 
                ? 'Informe a data em que o posto iniciará a operação nesta empresa.' 
                : 'Informe a data final da operação deste posto.'}
            </p>
            
            <input 
              type="date" 
              value={dataAcao} 
              onChange={e => setDataAcao(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-cyan-500 mb-6"
            />
            
            <div className="flex gap-3">
              <button onClick={() => setModalAcao(null)} className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmarAcao} className={`flex-1 px-4 py-3 font-bold rounded-xl text-white transition-colors ${modalAcao.tipo === 'Vincular' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}