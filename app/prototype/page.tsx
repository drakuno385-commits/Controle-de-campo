"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Plus, 
  Link2, 
  Unlink,
  Search,
  CheckCircle2,
  XCircle,
  Smartphone,
  LogOut,
  AlertTriangle,
  ServerCrash,
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase
} from 'lucide-react';

// --- TYPES ---
type Turno = 'Diurno' | 'Noturno' | 'Ambos';
type Faturamento = 'Diário' | 'Mensal';

interface Prestadora {
  id: string;
  cnpj: string;
  nome: string;
}

interface Unidade {
  id: string;
  nome: string;
  endereco: string;
}

interface Posto {
  id: string;
  unidadeId: string;
  prestadoraId: string | null;
  nome: string;
  escala: string;
  faturamento: Faturamento;
  temDiurno: boolean;
  horaInicioDiurno: string;
  horaFimDiurno: string;
  valorDiurno: number | null;
  temNoturno: boolean;
  horaInicioNoturno: string;
  horaFimNoturno: string;
  valorNoturno: number | null;
}

type StatusOS = 'Em Andamento' | 'Faturado' | 'Falta';

interface Apontamento {
  id: string;
  postoId: string;
  tecnico: string;
  checkIn: string; // ISO DateTime
  checkOut: string | null; // ISO DateTime
  falta: boolean;
  atrasoMinutos: number;
  valorOriginal: number | null;
  descontoCalculado: number;
  valorFaturado: number | null;
  status: StatusOS;
}

// --- INITIAL STATE ---
const initialPrestadoras: Prestadora[] = [
  { id: "p1", nome: "GWEP Segurança e Serviços", cnpj: "44.123.456/0001-90" },
  { id: "p2", nome: "Falcão Monitoramento", cnpj: "11.987.654/0001-22" }
];

const initialUnidades: Unidade[] = [
  { id: "u1", nome: "Condomínio Vista Azul", endereco: "Av. Paulista, 1000 - SP" },
  { id: "u2", nome: "Hospital São Lucas", endereco: "Rua da Matriz, 50 - SP" }
];

const initialPostos: Posto[] = [
  { 
    id: "po1", unidadeId: "u1", prestadoraId: "p1", nome: "Portaria Principal", escala: "12x36", faturamento: "Mensal", 
    temDiurno: true, horaInicioDiurno: "06:00", horaFimDiurno: "18:00", valorDiurno: 3500, 
    temNoturno: true, horaInicioNoturno: "18:00", horaFimNoturno: "06:00", valorNoturno: 4200 
  },
  { 
    id: "po2", unidadeId: "u2", prestadoraId: null, nome: "Limpeza UTI", escala: "8h", faturamento: "Diário", 
    temDiurno: true, horaInicioDiurno: "08:00", horaFimDiurno: "17:00", valorDiurno: 150, 
    temNoturno: false, horaInicioNoturno: "", horaFimNoturno: "", valorNoturno: null 
  },
  { 
    id: "po3", unidadeId: "u1", prestadoraId: "p2", nome: "Ronda Motorizada", escala: "12x36", faturamento: "Mensal", 
    temDiurno: false, horaInicioDiurno: "", horaFimDiurno: "", valorDiurno: null, 
    temNoturno: true, horaInicioNoturno: "19:00", horaFimNoturno: "07:00", valorNoturno: 5000 
  }
];

const initialApontamentos: Apontamento[] = [
  {
    id: "ap1", postoId: "po1", tecnico: "João Silva", checkIn: "2026-07-10T06:15:00", checkOut: "2026-07-10T18:00:00",
    falta: false, atrasoMinutos: 15, valorOriginal: 116.66, descontoCalculado: 2.43, valorFaturado: 114.23, status: 'Faturado'
  },
  {
    id: "ap2", postoId: "po1", tecnico: "João Silva", checkIn: "2026-07-12T06:00:00", checkOut: "2026-07-12T06:00:00",
    falta: true, atrasoMinutos: 0, valorOriginal: 116.66, descontoCalculado: 116.66, valorFaturado: 0, status: 'Falta'
  }
];

// --- MAIN COMPONENT ---
export default function GWEPPrototype() {
  const [activeTab, setActiveTab] = useState<'postos' | 'vinculos' | 'simulador' | 'os'>('postos');

  // "Store" state
  const [prestadoras] = useState<Prestadora[]>(initialPrestadoras);
  const [unidades] = useState<Unidade[]>(initialUnidades);
  const [postos, setPostos] = useState<Posto[]>(initialPostos);
  const [apontamentos, setApontamentos] = useState<Apontamento[]>(initialApontamentos);

  // --- ACTIONS ---
  const handleVincular = (postoId: string, prestadoraId: string | null) => {
    setPostos(postos.map(p => p.id === postoId ? { ...p, prestadoraId } : p));
  };

  const criarPosto = (novoPosto: Posto) => {
    setPostos([...postos, novoPosto]);
  };

  const checkIn = (postoId: string, tecnico: string, simulatedDate: Date) => {
    // Antifraude: Já existe OS aberta pra esse técnico?
    const hasOpen = apontamentos.find(a => a.tecnico === tecnico && a.status === 'Em Andamento');
    if (hasOpen) {
      alert("Técnico já possui um turno em andamento!");
      return;
    }
    
    // Antifraude: Já bateu ponto hoje nesse posto?
    const todayStr = simulatedDate.toISOString().substring(0, 10);
    const hasToday = apontamentos.find(a => a.tecnico === tecnico && a.postoId === postoId && a.checkIn.startsWith(todayStr));
    if (hasToday) {
      alert("Técnico já completou um turno ou tem falta registrada hoje para este posto!");
      return;
    }

    const posto = postos.find(p => p.id === postoId);
    if (!posto) return;

    // Calcular atraso
    const h = simulatedDate.getHours();
    const m = simulatedDate.getMinutes();
    const absMin = h * 60 + m;
    let expectedAbsMin = absMin;
    let isNoturno = false;

    if (h >= 17 || h < 6) {
      isNoturno = true;
      if (posto.temNoturno) {
        const [ph, pm] = posto.horaInicioNoturno.split(':').map(Number);
        expectedAbsMin = ph * 60 + pm;
        if (h < 6 && ph >= 17) expectedAbsMin -= 24 * 60;
      }
    } else {
      if (posto.temDiurno) {
        const [ph, pm] = posto.horaInicioDiurno.split(':').map(Number);
        expectedAbsMin = ph * 60 + pm;
      }
    }

    let atraso = absMin - expectedAbsMin;
    if (atraso < 0 || atraso > 12 * 60) atraso = 0;

    const novoApontamento: Apontamento = {
      id: `ap-${Date.now()}`,
      postoId,
      tecnico,
      checkIn: simulatedDate.toISOString(),
      checkOut: null,
      falta: false,
      atrasoMinutos: atraso,
      valorOriginal: null,
      descontoCalculado: 0,
      valorFaturado: null,
      status: 'Em Andamento'
    };

    setApontamentos([novoApontamento, ...apontamentos]);
  };

  const checkOut = (id: string, simulatedDate: Date) => {
    setApontamentos(apontamentos.map(ap => {
      if (ap.id !== id) return ap;
      
      const posto = postos.find(p => p.id === ap.postoId);
      if (!posto) return ap;

      const inDate = new Date(ap.checkIn);
      const h = inDate.getHours();
      let valorMensalOuDiario = 0;

      // Descobrir qual turno foi para faturar
      if (h >= 17 || h < 6) {
        valorMensalOuDiario = posto.valorNoturno || posto.valorDiurno || 0;
      } else {
        valorMensalOuDiario = posto.valorDiurno || posto.valorNoturno || 0;
      }

      const valorDia = posto.faturamento === 'Mensal' ? (valorMensalOuDiario / 30) : valorMensalOuDiario;
      let desconto = 0;

      if (ap.atrasoMinutos > 0) {
        const horasCarga = posto.escala.includes("12x") ? 12 : 8;
        const valorHora = valorDia / horasCarga;
        desconto = (ap.atrasoMinutos / 60) * valorHora;
      }

      return {
        ...ap,
        checkOut: simulatedDate.toISOString(),
        valorOriginal: valorDia,
        descontoCalculado: desconto,
        valorFaturado: valorDia - desconto,
        status: 'Faturado'
      };
    }));
  };

  const simularFalta = (postoId: string, tecnico: string, simulatedDate: Date) => {
    const todayStr = simulatedDate.toISOString().substring(0, 10);
    const hasToday = apontamentos.find(a => a.tecnico === tecnico && a.postoId === postoId && a.checkIn.startsWith(todayStr));
    if (hasToday) {
      alert("Ação negada: Técnico já tem registro hoje neste posto.");
      return;
    }

    const posto = postos.find(p => p.id === postoId);
    if (!posto) return;

    const valorMensalOuDiario = posto.valorDiurno || posto.valorNoturno || 0;
    const valorDia = posto.faturamento === 'Mensal' ? (valorMensalOuDiario / 30) : valorMensalOuDiario;

    const novaFalta: Apontamento = {
      id: `ap-${Date.now()}`,
      postoId,
      tecnico,
      checkIn: simulatedDate.toISOString(),
      checkOut: simulatedDate.toISOString(),
      falta: true,
      atrasoMinutos: 0,
      valorOriginal: valorDia,
      descontoCalculado: valorDia, // Glosa total
      valorFaturado: 0,
      status: 'Falta'
    };

    setApontamentos([novaFalta, ...apontamentos]);
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-brand-blue/30 overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            <ShieldIcon className="w-4 h-4 text-slate-900" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">GWEP <span className="text-cyan-400 font-light">FieldControl</span></h1>
        </div>
        <div className="flex gap-2">
          <TabButton active={activeTab === 'postos'} onClick={() => setActiveTab('postos')} icon={<MapPin />} label="Postos" />
          <TabButton active={activeTab === 'vinculos'} onClick={() => setActiveTab('vinculos')} icon={<Link2 />} label="Vínculos" />
          <TabButton active={activeTab === 'simulador'} onClick={() => setActiveTab('simulador')} icon={<Smartphone />} label="Simulador" />
          <TabButton active={activeTab === 'os'} onClick={() => setActiveTab('os')} icon={<LayoutDashboard />} label="Auditoria (OS)" />
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
        {activeTab === 'postos' && <TabPostos postos={postos} unidades={unidades} onCreate={criarPosto} />}
        {activeTab === 'vinculos' && <TabVinculos postos={postos} prestadoras={prestadoras} unidades={unidades} onVincular={handleVincular} />}
        {activeTab === 'simulador' && <TabSimulador postos={postos} unidades={unidades} apontamentos={apontamentos} onCheckIn={checkIn} onCheckOut={checkOut} onFalta={simularFalta} />}
        {activeTab === 'os' && <TabOS apontamentos={apontamentos} postos={postos} prestadoras={prestadoras} unidades={unidades} />}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
        active 
          ? "bg-slate-800 text-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.15)] border border-cyan-500/30" 
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
      }`}
    >
      {React.cloneElement(icon, { className: "w-4 h-4" })}
      {label}
    </button>
  );
}

// --- ABA 1: POSTOS ---
function TabPostos({ postos, unidades, onCreate }: any) {
  const [novo, setNovo] = useState<Partial<Posto>>({
    unidadeId: "u1", nome: "", escala: "12x36", faturamento: "Mensal",
    temDiurno: true, horaInicioDiurno: "06:00", horaFimDiurno: "18:00", valorDiurno: null,
    temNoturno: false, horaInicioNoturno: "18:00", horaFimNoturno: "06:00", valorNoturno: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ ...novo, id: `po-${Date.now()}`, prestadoraId: null } as Posto);
    alert("Posto criado com sucesso! Ele estará disponível na tela de Vínculos.");
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
            <input required type="text" value={novo.nome} onChange={e => setNovo({...novo, nome: e.target.value})} placeholder="Ex: Vigilância Armada" className="w-full mt-1 bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-cyan-400 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Escala</label>
              <select value={novo.escala} onChange={e => setNovo({...novo, escala: e.target.value})} className="w-full mt-1 bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-cyan-400 outline-none">
                <option value="8h">8 Horas</option>
                <option value="12x36">12x36</option>
                <option value="24h">24 Horas</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Faturamento</label>
              <select value={novo.faturamento} onChange={e => setNovo({...novo, faturamento: e.target.value})} className="w-full mt-1 bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-cyan-400 outline-none">
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
          {postos.map((p: Posto) => {
            const uni = unidades.find((u: any) => u.id === p.unidadeId);
            return (
              <div key={p.id} className="bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-bold">{uni?.nome}</h3>
                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded">{p.escala}</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{p.nome}</p>
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

// --- ABA 2: VINCULOS ---
function TabVinculos({ postos, prestadoras, unidades, onVincular }: any) {
  const semVinculo = postos.filter((p: Posto) => p.prestadoraId === null);
  
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
          {semVinculo.map((p: Posto) => {
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
                  <p className="text-[11px] text-slate-400 mb-2">{p.nome}</p>
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
        {prestadoras.map((prest: Prestadora) => {
          const vinculados = postos.filter((p: Posto) => p.prestadoraId === prest.id);
          return (
            <div 
              key={prest.id}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const pId = e.dataTransfer.getData("postoId"); if(pId) onVincular(pId, prest.id); }}
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
                {vinculados.map((p: Posto) => {
                  const uni = unidades.find((u: any) => u.id === p.unidadeId);
                  return (
                    <div key={p.id} className="bg-slate-950 border border-white/5 p-3 rounded-lg flex justify-between items-center group">
                      <div>
                        <h4 className="text-xs font-bold text-white">{uni?.nome}</h4>
                        <p className="text-[10px] text-slate-400">{p.nome}</p>
                      </div>
                      <button onClick={() => onVincular(p.id, null)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded transition-all">
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

// --- ABA 3: SIMULADOR ---
function TabSimulador({ postos, unidades, apontamentos, onCheckIn, onCheckOut, onFalta }: any) {
  const [tecnico, setTecnico] = useState("Técnico Simulado");
  const [postoId, setPostoId] = useState("");
  // Hora simulada para permitir testar atrasos (Padrão: hora atual)
  const [simDate, setSimDate] = useState(() => {
    const d = new Date();
    // Round to nearest minute for clean display
    d.setSeconds(0); d.setMilliseconds(0);
    return d;
  });

  const postosValidos = postos.filter((p: Posto) => p.prestadoraId !== null);
  const ativo = apontamentos.find((a: Apontamento) => a.tecnico === tecnico && a.status === 'Em Andamento');

  const addMinutes = (m: number) => {
    setSimDate(prev => new Date(prev.getTime() + m * 60000));
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
                {postosValidos.map((p: Posto) => (
                  <option key={p.id} value={p.id}>{unidades.find((u:any)=>u.id===p.unidadeId)?.nome} - {p.nome}</option>
                ))}
              </select>

              <div className="mt-auto flex flex-col gap-4">
                <button 
                  onClick={() => onCheckIn(postoId, tecnico, simDate)}
                  disabled={!postoId}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-slate-900 font-black text-lg disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_25px_rgba(52,211,153,0.3)] active:scale-95"
                >
                  BATER PONTO
                </button>
                <button 
                  onClick={() => onFalta(postoId, tecnico, simDate)}
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
                <p className="text-[10px] text-slate-500 mt-1">{postos.find((p:any) => p.id === ativo.postoId)?.nome}</p>
                {ativo.atrasoMinutos > 0 && (
                  <div className="mt-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" /> Turno iniciado com {ativo.atrasoMinutos} min de atraso.
                  </div>
                )}
              </div>

              <button 
                onClick={() => onCheckOut(ativo.id, simDate)}
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

// --- ABA 4: OS / AUDITORIA ---
function TabOS({ apontamentos, postos, prestadoras, unidades }: any) {
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
              const posto = postos.find((p:any) => p.id === ap.postoId);
              const unidade = unidades.find((u:any) => u.id === posto?.unidadeId);
              const empresa = prestadoras.find((pr:any) => pr.id === posto?.prestadoraId);
              
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
                    <p className="text-slate-500 text-[10px]">{posto?.nome}</p>
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

// Minimal Icons setup
function ShieldIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
