import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Clock, Plus, Link2, Unlink, Search, 
  CheckCircle2, XCircle, Smartphone, LayoutDashboard, Users, GripVertical, Info, FileText, BarChart3, Download, Camera, AlertTriangle, ChevronDown, ChevronRight, Briefcase
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [buscaPosto, setBuscaPosto] = useState("");
  const [buscaEmpresa, setBuscaEmpresa] = useState("");

  const semVinculo = postos.filter((p: Posto) => 
    p.prestadoraId === null && p.nome.toLowerCase().includes(buscaPosto.toLowerCase())
  );
  
  const empresasFiltradas = prestadoras.filter((emp: Prestadora) => 
    emp.nome.toLowerCase().includes(buscaEmpresa.toLowerCase()) || 
    emp.cnpj.includes(buscaEmpresa)
  );

  const confirmarAcao = () => {
    if (!modalAcao || !dataAcao) return;
    onVincular(modalAcao.postoId, modalAcao.empresaId, dataAcao);
    setModalAcao(null);
  };
  
  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full min-h-[700px] fade-in">
      <div className="w-full xl:w-[400px] shrink-0 bg-[#0A1120]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col h-[calc(100vh-100px)]">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
            <ServerCrash className="w-5 h-5 text-rose-400" /> Postos ({semVinculo.length} Pendentes)
          </h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">Arraste os postos para vinculá-los ou busque por nome.</p>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-rose-400 transition-colors" />
            <input 
              type="text" 
              value={buscaPosto} 
              onChange={e => setBuscaPosto(e.target.value)} 
              placeholder="Buscar posto (pendente ou vinculado)..." 
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:border-rose-500/50 outline-none transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {semVinculo.length === 0 && <p className="text-slate-500 text-sm text-center py-10">Não há postos pendentes de vínculo.</p>}
          {semVinculo.map((p: Posto) => {
            return (
              <div 
                key={p.id} draggable 
                onDragStart={(e) => { e.dataTransfer.setData("postoId", p.id); setIsDragging(true); }}
                onDragEnd={() => setIsDragging(false)}
                className="bg-white/[0.02] border border-white/5 rounded-xl cursor-grab active:cursor-grabbing px-3 py-2.5 relative group flex flex-col gap-1.5 hover:bg-white/[0.04] hover:border-rose-500/30 transition-all shadow-md"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/80 group-hover:bg-rose-400 transition-colors rounded-l-xl" />
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-rose-400 shrink-0 transition-colors" />
                  <h3 className="text-[11px] font-bold text-slate-200 leading-tight flex-1 truncate" title={p.nome}>{p.nome}</h3>
                </div>
                <div className="flex gap-1.5 pl-6 font-mono">
                  {p.temDiurno && <span className="text-[8px] font-bold bg-cyan-950/30 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">R${p.valorDiurno} (D)</span>}
                  {p.temNoturno && <span className="text-[8px] font-bold bg-blue-950/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">R${p.valorNoturno} (N)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-[calc(100vh-100px)]">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">Empresas Contratadas</h2>
            <p className="text-sm text-slate-500 mt-1">Arraste os postos para dentro dos quadros das empresas.</p>
          </div>
          <div className="relative group w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="text" 
              value={buscaEmpresa} 
              onChange={e => setBuscaEmpresa(e.target.value)} 
              placeholder="Filtrar empresas..." 
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-3">
          {empresasFiltradas.length === 0 && <p className="text-slate-500">Nenhuma empresa encontrada com este filtro.</p>}
          {empresasFiltradas.map((prest: Prestadora) => {
          const vinculados = postos.filter((p: Posto) => 
            p.prestadoraId === prest.id && p.nome.toLowerCase().includes(buscaPosto.toLowerCase())
          );
          return (
            <div 
              key={prest.id}
              onDragOver={e => { e.preventDefault(); setExpandedId(prest.id); }}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const pId = e.dataTransfer.getData("postoId"); if(pId) setModalAcao({ postoId: pId, empresaId: prest.id, tipo: 'Vincular' }); }}
              className={`bg-[#0A1120]/40 backdrop-blur-2xl border-2 rounded-xl transition-all duration-300 shadow-md flex flex-col relative overflow-hidden group/board ${isDragging ? 'border-dashed border-cyan-500/50 bg-cyan-900/10' : 'border-white/5 hover:border-cyan-500/30'}`}
            >
              <div 
                className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                onClick={() => setExpandedId(expandedId === prest.id ? null : prest.id)}
              >
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#0A1120] border border-white/5 flex items-center justify-center shrink-0 group-hover/board:border-cyan-500/30 group-hover/board:text-cyan-400 transition-colors">
                      <Building2 className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{prest.nome}</h3>
                      <p className="text-[10px] font-mono text-slate-500">{prest.cnpj}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="bg-[#0A1120]/80 border border-white/10 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-400 flex items-center">
                      Vagas vinculadas: <span className="text-cyan-400 ml-1">{vinculados.length}</span>
                    </div>
                    {expandedId === prest.id ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                 </div>
              </div>

              {expandedId === prest.id && (
                <div className="border-t border-white/5 bg-black/20 p-4 space-y-2 relative z-10">
                  {vinculados.length === 0 && <div className="h-16 flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg"><p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Arraste os postos para cá</p></div>}
                  {vinculados.map((p: Posto) => (
                    <div key={p.id} className="bg-[#0A1120]/60 border border-white/5 px-3 py-2 rounded-lg flex justify-between items-center group/card hover:bg-white/[0.04] transition-colors shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/50 rounded-l-lg" />
                      <div className="pl-2 truncate pr-2 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-500/50" />
                        <h4 className="text-[11px] font-bold text-slate-200 truncate" title={p.nome}>{p.nome}</h4>
                      </div>
                      <button onClick={() => setModalAcao({ postoId: p.id, empresaId: null, tipo: 'Desvincular' })} className="opacity-0 group-hover/card:opacity-100 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-md transition-all shrink-0" title="Desvincular (Remover)">
                        <Unlink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
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