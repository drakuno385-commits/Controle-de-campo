"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Clock, Plus, Link2, Unlink, Search, 
  CheckCircle2, XCircle, Smartphone, LayoutDashboard, Users, GripVertical, Info, FileText
} from 'lucide-react';

type Faturamento = 'Diário' | 'Mensal';
type StatusOS = 'Em Andamento' | 'Faturado' | 'Falta';

interface Prestadora { id: string; cnpj: string; nome: string; }
interface Unidade { id: string; nome: string; endereco: string; }
interface Posto {
  id: string; unidadeId: string; prestadoraId: string | null; nome: string; escala: string; faturamento: Faturamento;
  temDiurno: boolean; horaInicioDiurno: string; horaFimDiurno: string; valorDiurno: number | null;
  temNoturno: boolean; horaInicioNoturno: string; horaFimNoturno: string; valorNoturno: number | null;
}
interface Apontamento {
  id: string; postoId: string; tecnico: string; checkIn: string; checkOut: string | null;
  falta: boolean; atrasoMinutos: number; valorOriginal: number | null; descontoCalculado: number; valorFaturado: number | null; status: StatusOS;
}

const SEED_DATA = {
  prestadoras: [
    { id: "p1", nome: "GWEP Segurança Premium", cnpj: "44.123.456/0001-90" },
    { id: "p2", nome: "Falcão Monitoramento", cnpj: "11.987.654/0001-22" }
  ],
  unidades: [
    { id: "u1", nome: "Condomínio Vista Azul", endereco: "Av. Paulista, 1000 - SP" },
    { id: "u2", nome: "Hospital São Lucas", endereco: "Rua da Matriz, 50 - SP" }
  ],
  postos: [
    { 
      id: "po1", unidadeId: "u1", prestadoraId: "p1", nome: "Portaria Principal", escala: "12x36", faturamento: "Mensal", 
      temDiurno: true, horaInicioDiurno: "06:00", horaFimDiurno: "18:00", valorDiurno: 3500, temNoturno: true, horaInicioNoturno: "18:00", horaFimNoturno: "06:00", valorNoturno: 4200 
    },
    { 
      id: "po2", unidadeId: "u2", prestadoraId: null, nome: "Limpeza UTI (Órfão)", escala: "8h", faturamento: "Diário", 
      temDiurno: true, horaInicioDiurno: "08:00", horaFimDiurno: "17:00", valorDiurno: 150, temNoturno: false, horaInicioNoturno: "", horaFimNoturno: "", valorNoturno: null 
    },
    { 
      id: "po3", unidadeId: "u1", prestadoraId: "p2", nome: "Ronda Motorizada", escala: "12x36", faturamento: "Mensal", 
      temDiurno: false, horaInicioDiurno: "", horaFimDiurno: "", valorDiurno: null, temNoturno: true, horaInicioNoturno: "19:00", horaFimNoturno: "07:00", valorNoturno: 5000 
    }
  ],
  apontamentos: [
    {
      id: "ap1", postoId: "po1", tecnico: "João Silva", checkIn: "2026-07-10T06:45:00", checkOut: "2026-07-10T18:00:00",
      falta: false, atrasoMinutos: 45, valorOriginal: 116.66, descontoCalculado: 7.29, valorFaturado: 109.37, status: 'Faturado' as StatusOS
    },
    {
      id: "ap2", postoId: "po3", tecnico: "Carlos Moura", checkIn: "2026-07-12T19:00:00", checkOut: "2026-07-12T19:00:00",
      falta: true, atrasoMinutos: 0, valorOriginal: 166.66, descontoCalculado: 166.66, valorFaturado: 0, status: 'Falta' as StatusOS
    }
  ]
};

function usePersistentState<T>(key: string, initialValue: T): [T, (val: T) => void, boolean] {
  const [state, setState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setState(JSON.parse(stored));
    } catch (e) { console.error(e); }
    setIsLoaded(true);
  }, [key]);

  const setValue = (value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  };
  return [state, setValue, isLoaded];
}

export default function GWEPEnterpriseApp() {
  const [activeTab, setActiveTab] = useState<'empresas' | 'postos' | 'vinculos' | 'simulador' | 'os'>('empresas');

  const [prestadoras, setPrestadoras, l1] = usePersistentState<Prestadora[]>('gwep_prestadoras', SEED_DATA.prestadoras);
  const [unidades, , l2] = usePersistentState<Unidade[]>('gwep_unidades', SEED_DATA.unidades);
  const [postos, setPostos, l3] = usePersistentState<Posto[]>('gwep_postos', SEED_DATA.postos);
  const [apontamentos, setApontamentos, l4] = usePersistentState<Apontamento[]>('gwep_apontamentos', SEED_DATA.apontamentos);
  const [isDragging, setIsDragging] = useState(false);

  if (!l1 || !l2 || !l3 || !l4) return <div className="min-h-screen bg-slate-950 text-cyan-400 font-mono text-xl flex items-center justify-center animate-pulse">Inicializando Sistema Neural...</div>;

  const handleVincular = (postoId: string, prestadoraId: string | null) => setPostos(postos.map(p => p.id === postoId ? { ...p, prestadoraId } : p));
  const criarPosto = (novo: Posto) => setPostos([novo, ...postos]);
  const criarPrestadora = (nova: Prestadora) => setPrestadoras([nova, ...prestadoras]);

  const checkIn = (postoId: string, tecnico: string, simulatedDate: Date) => {
    const todayStr = simulatedDate.toISOString().substring(0, 10);
    if (apontamentos.find(a => a.tecnico === tecnico && a.status === 'Em Andamento')) return alert("Já há um turno ativo para este técnico!");
    if (apontamentos.find(a => a.tecnico === tecnico && a.postoId === postoId && a.checkIn.startsWith(todayStr))) return alert("Turno ou falta já registrado para hoje neste local.");

    const posto = postos.find(p => p.id === postoId);
    if (!posto) return;

    const h = simulatedDate.getHours();
    const absMin = h * 60 + simulatedDate.getMinutes();
    let expectedAbsMin = absMin;

    if (h >= 17 || h < 6) { 
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

    setApontamentos([{
      id: `ap-${Date.now()}`, postoId, tecnico, checkIn: simulatedDate.toISOString(), checkOut: null,
      falta: false, atrasoMinutos: atraso, valorOriginal: null, descontoCalculado: 0, valorFaturado: null, status: 'Em Andamento'
    }, ...apontamentos]);
  };

  const checkOut = (id: string, simulatedDate: Date) => {
    setApontamentos(apontamentos.map(ap => {
      if (ap.id !== id) return ap;
      const posto = postos.find(p => p.id === ap.postoId);
      if (!posto) return ap;

      const inDate = new Date(ap.checkIn);
      const h = inDate.getHours();
      const isNight = (h >= 17 || h < 6);
      const valorBase = isNight ? (posto.valorNoturno || posto.valorDiurno || 0) : (posto.valorDiurno || posto.valorNoturno || 0);
      
      const valorDia = posto.faturamento === 'Mensal' ? (valorBase / 30) : valorBase;
      let desconto = 0;

      if (ap.atrasoMinutos > 0) {
        const horasCarga = posto.escala.includes("12x") ? 12 : 8;
        const valorHora = valorDia / horasCarga;
        desconto = (ap.atrasoMinutos / 60) * valorHora;
      }

      return {
        ...ap, checkOut: simulatedDate.toISOString(),
        valorOriginal: valorDia, descontoCalculado: desconto, valorFaturado: valorDia - desconto, status: 'Faturado'
      };
    }));
  };

  const simularFalta = (postoId: string, tecnico: string, simulatedDate: Date) => {
    const todayStr = simulatedDate.toISOString().substring(0, 10);
    if (apontamentos.find(a => a.tecnico === tecnico && a.postoId === postoId && a.checkIn.startsWith(todayStr))) return alert("Registro diário bloqueado.");
    
    const posto = postos.find(p => p.id === postoId);
    if (!posto) return;

    const valorBase = posto.valorDiurno || posto.valorNoturno || 0;
    const valorDia = posto.faturamento === 'Mensal' ? (valorBase / 30) : valorBase;

    setApontamentos([{
      id: `ap-${Date.now()}`, postoId, tecnico, checkIn: simulatedDate.toISOString(), checkOut: simulatedDate.toISOString(),
      falta: true, atrasoMinutos: 0, valorOriginal: valorDia, descontoCalculado: valorDia, valorFaturado: 0, status: 'Falta'
    }, ...apontamentos]);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(30, 41, 59, 0.8); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.3); }
      `}} />
      <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
        {/* GLOBAL BACKLIGHT EFFECTS */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[900px] h-[900px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

        {/* SIDEBAR */}
        <aside className="w-[300px] border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col z-20 shrink-0 shadow-2xl">
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(0,243,255,0.3)] border border-white/10 shrink-0">
              <ShieldIcon className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight leading-none">GWEP<br/><span className="text-cyan-400 font-light text-base tracking-widest uppercase mt-1 block">FieldControl</span></h1>
          </div>
          
          <nav className="flex-1 p-5 space-y-3 overflow-y-auto">
            <SidebarBtn active={activeTab==='empresas'} onClick={()=>setActiveTab('empresas')} icon={<Building2 />} label="Empresas" />
            <SidebarBtn active={activeTab==='postos'} onClick={()=>setActiveTab('postos')} icon={<MapPin />} label="Serviços & Postos" />
            <SidebarBtn active={activeTab==='vinculos'} onClick={()=>setActiveTab('vinculos')} icon={<Link2 />} label="Vínculos Operacionais" />
            <SidebarBtn active={activeTab==='simulador'} onClick={()=>setActiveTab('simulador')} icon={<Smartphone />} label="App do Técnico" />
            <SidebarBtn active={activeTab==='os'} onClick={()=>setActiveTab('os')} icon={<LayoutDashboard />} label="Auditoria Contábil" />
          </nav>

          <div className="p-6 border-t border-white/5 bg-slate-950/30 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-mono leading-tight">
              Sistema Híbrido V2<br/>Enterprise Edition
            </div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" title="Sistema Online" />
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-10 z-10 overflow-y-auto flex flex-col w-full h-full">
          {activeTab === 'empresas' && <TabEmpresas prestadoras={prestadoras} onCreate={criarPrestadora} />}
          {activeTab === 'postos' && <TabPostos postos={postos} unidades={unidades} onCreate={criarPosto} />}
          {activeTab === 'vinculos' && <TabVinculos postos={postos} prestadoras={prestadoras} unidades={unidades} onVincular={handleVincular} isDragging={isDragging} setIsDragging={setIsDragging} />}
          {activeTab === 'simulador' && <TabSimulador postos={postos} unidades={unidades} apontamentos={apontamentos} onCheckIn={checkIn} onCheckOut={checkOut} onFalta={simularFalta} />}
          {activeTab === 'os' && <TabOS apontamentos={apontamentos} postos={postos} prestadoras={prestadoras} unidades={unidades} />}
        </main>
      </div>
    </>
  );
}

// --- UTILS ---
const formatMoney = (val: number | null) => val !== null ? `R$ ${val.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}` : '-';

function SidebarBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-base font-bold transition-all duration-300 relative group overflow-hidden ${
      active ? "bg-slate-800/80 text-cyan-400 shadow-lg border border-cyan-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
    }`}>
      {/* Active Glowing Border on the left */}
      {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] rounded-r-full" />}
      
      {React.cloneElement(icon, { className: `w-6 h-6 shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}` })} 
      <span className="text-left">{label}</span>
    </button>
  );
}

function ShieldIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

// ==========================================
// TELA: EMPRESAS
// ==========================================
function TabEmpresas({ prestadoras, onCreate }: any) {
  const [nova, setNova] = useState({ nome: '', cnpj: '' });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ id: `prest-${Date.now()}`, ...nova });
    setNova({ nome: '', cnpj: '' });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full fade-in">
      <div className="w-full xl:w-[480px] shrink-0 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-2xl h-fit">
        <h2 className="text-2xl font-bold text-slate-100 mb-8 tracking-tight flex items-center gap-3">
          <Plus className="w-6 h-6 text-cyan-400" /> Nova Prestadora
        </h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div>
            <label className="text-sm font-semibold text-slate-400 block mb-2">Razão Social / Nome Fantasia</label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input required type="text" value={nova.nome} onChange={e=>setNova({...nova, nome: e.target.value})} placeholder="Ex: GWEP Segurança" className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-base text-slate-200 focus:border-cyan-400/50 focus:bg-slate-950/80 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-400 block mb-2">CNPJ</label>
            <div className="relative group">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input required type="text" value={nova.cnpj} onChange={e=>setNova({...nova, cnpj: e.target.value})} placeholder="00.000.000/0001-00" className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-base font-mono text-slate-200 focus:border-cyan-400/50 focus:bg-slate-950/80 outline-none transition-all" />
            </div>
          </div>
          <button type="submit" className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-2xl text-lg shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] hover:-translate-y-0.5 active:translate-y-0 transition-all">
            Cadastrar Empresa
          </button>
        </form>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-6">
          {prestadoras.length === 0 && <p className="text-slate-500 col-span-full">Nenhuma prestadora cadastrada.</p>}
          {prestadoras.map((p: Prestadora) => (
            <div key={p.id} className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 hover:border-cyan-500/30 hover:bg-slate-900/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-md group shadow-xl">
              <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mb-5 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all">
                <Building2 className="w-7 h-7 text-cyan-500" />
              </div>
              <h3 className="text-slate-100 font-bold tracking-tight text-xl mb-1">{p.nome}</h3>
              <p className="text-sm font-mono text-slate-500">{p.cnpj}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TELA: POSTOS
// ==========================================
function TabPostos({ postos, unidades, onCreate }: any) {
  const defaults = {
    unidadeId: "u1", nome: "", escala: "12x36", faturamento: "Mensal",
    temDiurno: true, horaInicioDiurno: "06:00", horaFimDiurno: "18:00", valorDiurno: null,
    temNoturno: false, horaInicioNoturno: "18:00", horaFimNoturno: "06:00", valorNoturno: null
  };
  const [novo, setNovo] = useState<Partial<Posto>>(defaults);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ ...novo, id: `po-${Date.now()}`, prestadoraId: null } as Posto);
    setNovo(defaults);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full fade-in">
      <div className="w-full xl:w-[480px] shrink-0 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-2xl h-fit">
        <h2 className="text-2xl font-bold text-slate-100 mb-8 tracking-tight flex items-center gap-3">
          <Plus className="w-6 h-6 text-cyan-400" /> Demanda Operacional
        </h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div>
            <label className="text-sm font-semibold text-slate-400 block mb-2">Cliente / Unidade</label>
            <select value={novo.unidadeId} onChange={e=>setNovo({...novo, unidadeId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-base text-slate-200 focus:border-cyan-400/50 outline-none transition-colors appearance-none">
              {unidades.map((u:any) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-400 block mb-2">Nome do Serviço</label>
            <input required type="text" value={novo.nome} onChange={e=>setNovo({...novo, nome: e.target.value})} placeholder="Ex: Portaria Norte" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-base text-slate-200 focus:border-cyan-400/50 outline-none transition-colors" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-400 block mb-2">Escala</label>
              <select value={novo.escala} onChange={e=>setNovo({...novo, escala: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-base text-slate-200 outline-none appearance-none">
                <option value="8h">8 Horas</option>
                <option value="12x36">12x36</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-400 block mb-2">Faturamento</label>
              <select value={novo.faturamento} onChange={e=>setNovo({...novo, faturamento: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-base text-slate-200 outline-none appearance-none">
                <option value="Mensal">Mensal</option>
                <option value="Diário">Diário</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <ShiftPanel title="Turno Diurno" active={novo.temDiurno!} toggle={() => setNovo({...novo, temDiurno: !novo.temDiurno})} hI={novo.horaInicioDiurno!} setHi={(v) => setNovo({...novo, horaInicioDiurno: v})} hF={novo.horaFimDiurno!} setHf={(v) => setNovo({...novo, horaFimDiurno: v})} val={novo.valorDiurno} setVal={(v) => setNovo({...novo, valorDiurno: v})} color="cyan" />
            <ShiftPanel title="Turno Noturno" active={novo.temNoturno!} toggle={() => setNovo({...novo, temNoturno: !novo.temNoturno})} hI={novo.horaInicioNoturno!} setHi={(v) => setNovo({...novo, horaInicioNoturno: v})} hF={novo.horaFimNoturno!} setHf={(v) => setNovo({...novo, horaFimNoturno: v})} val={novo.valorNoturno} setVal={(v) => setNovo({...novo, valorNoturno: v})} color="blue" />
          </div>
          
          <button type="submit" className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-2xl text-lg shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] hover:-translate-y-0.5 active:translate-y-0 transition-all">Criar Demanda</button>
        </form>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-6">
          {postos.length === 0 && <p className="text-slate-500 col-span-full">Nenhum posto cadastrado.</p>}
          {postos.map((p: Posto) => {
            const uni = unidades.find((u:any) => u.id === p.unidadeId);
            return (
              <div key={p.id} className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 hover:border-slate-700 hover:bg-slate-900/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-md shadow-xl flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-slate-100 font-bold tracking-tight text-lg leading-tight">{uni?.nome}</h3>
                  <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ml-2">{p.escala} | {p.faturamento}</span>
                </div>
                <p className="text-base text-slate-400 mb-6 flex-1">{p.nome}</p>
                <div className="flex flex-col gap-3 mt-auto">
                  {p.temDiurno && (
                    <div className="flex justify-between items-center text-sm bg-cyan-950/20 border border-cyan-500/10 px-4 py-3 rounded-xl shadow-inner">
                      <span className="text-cyan-400/80 font-bold flex items-center gap-2"><Clock className="w-4 h-4"/> {p.horaInicioDiurno}-{p.horaFimDiurno}</span>
                      <span className="font-mono text-cyan-400 font-bold">{formatMoney(p.valorDiurno)}</span>
                    </div>
                  )}
                  {p.temNoturno && (
                    <div className="flex justify-between items-center text-sm bg-blue-950/20 border border-blue-500/10 px-4 py-3 rounded-xl shadow-inner">
                      <span className="text-blue-400/80 font-bold flex items-center gap-2"><Clock className="w-4 h-4"/> {p.horaInicioNoturno}-{p.horaFimNoturno}</span>
                      <span className="font-mono text-blue-400 font-bold">{formatMoney(p.valorNoturno)}</span>
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

function ShiftPanel({ title, active, toggle, hI, setHi, hF, setHf, val, setVal, color }: any) {
  const theme = color === 'cyan' ? 'accent-cyan-400 text-cyan-400' : 'accent-blue-500 text-blue-400';
  return (
    <div className={`bg-slate-950/50 border border-slate-800 rounded-2xl p-5 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
      <div className="flex items-center gap-4 mb-4 cursor-pointer pointer-events-auto" onClick={toggle}>
        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center shadow-inner ${active ? (color==='cyan'?'bg-cyan-500':'bg-blue-500') : 'bg-slate-700'}`}>
          <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
        <span className="text-base font-semibold text-slate-200">{title}</span>
      </div>
      <div className={`grid grid-cols-3 gap-3 transition-opacity duration-500`}>
        <div className="relative group">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
          <input type="time" value={hI} onChange={e=>setHi(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-sm text-slate-300 outline-none focus:border-slate-600 font-mono transition-colors" />
        </div>
        <div className="relative group">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
          <input type="time" value={hF} onChange={e=>setHf(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-sm text-slate-300 outline-none focus:border-slate-600 font-mono transition-colors" />
        </div>
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 group-focus-within:text-slate-400 transition-colors">R$</span>
          <input type="number" value={val||''} onChange={e=>setVal(Number(e.target.value))} className={`w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-3 text-sm font-mono font-bold outline-none ${theme} focus:border-${color}-500/50 transition-colors`} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TELA: VÍNCULOS
// ==========================================
function TabVinculos({ postos, prestadoras, unidades, onVincular, isDragging, setIsDragging }: any) {
  const semVinculo = postos.filter((p: Posto) => p.prestadoraId === null);
  
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
            const uni = unidades.find((u:any) => u.id === p.unidadeId);
            return (
              <div 
                key={p.id} draggable 
                onDragStart={(e) => { e.dataTransfer.setData("postoId", p.id); setIsDragging(true); }}
                onDragEnd={() => setIsDragging(false)}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl cursor-grab active:cursor-grabbing p-5 relative group flex items-center gap-4 border-l-[4px] border-l-rose-500/80 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-slate-700 transition-all"
              >
                <GripVertical className="w-6 h-6 text-slate-600 group-hover:text-cyan-500 shrink-0 transition-colors" />
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-200 leading-tight">{uni?.nome}</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">{p.nome}</p>
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
              onDrop={e => { e.preventDefault(); setIsDragging(false); const pId = e.dataTransfer.getData("postoId"); if(pId) onVincular(pId, prest.id); }}
              className={`bg-slate-900/50 backdrop-blur-md border-2 rounded-3xl p-6 transition-all duration-300 shadow-xl ${isDragging ? 'border-dashed border-cyan-500/50 animate-pulse bg-cyan-950/20 shadow-[0_0_30px_rgba(0,243,255,0.1)]' : 'border-slate-800/80 hover:border-slate-700 hover:-translate-y-1'}`}
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
              <div className="space-y-4">
                {vinculados.length === 0 && <p className="text-sm text-slate-600 text-center py-12">Arraste cartões para cá.</p>}
                {vinculados.map((p: Posto) => (
                  <div key={p.id} className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl flex justify-between items-center group hover:bg-slate-900 transition-colors shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{unidades.find((u:any)=>u.id===p.unidadeId)?.nome}</h4>
                      <p className="text-xs text-slate-500 mt-1">{p.nome}</p>
                    </div>
                    <button onClick={() => onVincular(p.id, null)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-all" title="Desvincular">
                      <Unlink className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// TELA: SIMULADOR
// ==========================================
function TabSimulador({ postos, unidades, apontamentos, onCheckIn, onCheckOut, onFalta }: any) {
  const [tecnico, setTecnico] = useState("João Silva");
  const [postoId, setPostoId] = useState("po1");
  const [simDate, setSimDate] = useState(() => { const d = new Date(); d.setSeconds(0); d.setMilliseconds(0); return d; });

  const addMinutes = (m: number) => setSimDate(prev => new Date(prev.getTime() + m * 60000));
  
  const postosValidos = postos.filter((p: Posto) => p.prestadoraId !== null);
  const ativo = apontamentos.find((a: Apontamento) => a.tecnico === tecnico && a.checkOut === null && !a.falta);

  return (
    <div className="flex flex-col items-center pt-8 w-full fade-in">
      <div className="mb-10 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex gap-5 items-center shadow-xl">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tempo Decorrido:</span>
        <span className="font-mono text-cyan-400 bg-slate-950 px-4 py-2 rounded-lg font-bold text-base border border-cyan-500/10 shadow-inner">{simDate.toLocaleString('pt-BR')}</span>
        <div className="flex gap-3 ml-2">
          <button onClick={()=>addMinutes(-60)} className="text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">-1h</button>
          <button onClick={()=>addMinutes(15)} className="text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">+15m</button>
          <button onClick={()=>addMinutes(60)} className="text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">+1h</button>
        </div>
      </div>

      <div className="w-[400px] h-[800px] bg-slate-950 rounded-[56px] border-[12px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-0" />
        {ativo && <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none z-0 transition-all duration-1000" />}

        <div className="h-8 flex justify-between items-center px-10 text-xs font-bold text-white/60 pt-2 shrink-0 relative z-10">
          <span>{simDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-5 h-3 border border-white/60 rounded-[3px] relative"><div className="absolute left-0 top-0 h-full w-[80%] bg-white/60" /></div>
          </div>
        </div>

        <div className="p-8 flex-1 flex flex-col relative z-10">
          <div className="flex items-center gap-4 mb-12 mt-8">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Users className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="flex-1 group">
              <p className="text-xs text-slate-400 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors">Identificação</p>
              <input value={tecnico} onChange={e=>setTecnico(e.target.value)} className="bg-transparent text-white font-bold text-xl border-b border-dashed border-white/20 outline-none w-full pb-2 mt-1 focus:border-cyan-400 transition-colors" />
            </div>
          </div>

          {!ativo ? (
            <div className="flex flex-col flex-1">
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Novo Expediente</h2>
              <p className="text-sm text-slate-400 mb-8">Confirme o local de trabalho para iniciar.</p>
              
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-2 mb-auto shadow-inner">
                <select value={postoId} onChange={e=>setPostoId(e.target.value)} className="w-full bg-transparent p-5 text-base text-slate-200 outline-none font-semibold appearance-none">
                  {postosValidos.map((p: Posto) => <option key={p.id} value={p.id}>{unidades.find((u:any)=>u.id===p.unidadeId)?.nome} - {p.nome}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-5 mt-8">
                <button onClick={() => onCheckIn(postoId, tecnico, simDate)} className="w-full py-6 rounded-[32px] bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-black text-2xl shadow-[0_0_40px_rgba(52,211,153,0.3)] hover:scale-105 active:scale-95 transition-all">
                  BATER PONTO
                </button>
                <button onClick={() => onFalta(postoId, tecnico, simDate)} className="w-full py-5 rounded-[32px] border-2 border-rose-500/30 text-rose-400 font-bold text-base hover:bg-rose-500/10 hover:border-rose-500/50 active:scale-95 transition-all">
                  Registrar Falta Diária
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 items-center justify-center">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="w-48 h-48 rounded-full border-[3px] border-cyan-500/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent animate-[spin_3s_linear_infinite]" style={{ transformOrigin: 'bottom center', height: '50%', top: '0' }}></div>
                  <div className="text-center relative z-10">
                    <span className="block text-5xl font-black text-cyan-400 font-mono tracking-tight">{simDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-3 block bg-slate-950/50 border border-slate-800 px-3 py-1.5 rounded-full">Trabalhando</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl w-full p-6 mb-auto text-center backdrop-blur-sm shadow-inner">
                <p className="text-xs text-slate-400 uppercase tracking-widest">Localização Confirmada</p>
                <p className="text-lg font-bold text-slate-100 mt-2">{unidades.find((u:any) => u.id === postos.find((p:any) => p.id === ativo.postoId)?.unidadeId)?.nome}</p>
                <p className="text-sm text-slate-500 mt-1">{postos.find((p:any) => p.id === ativo.postoId)?.nome}</p>
                
                {ativo.atrasoMinutos > 0 && (
                  <div className="mt-5 bg-rose-950/30 border border-rose-500/30 text-rose-400 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" /> Penalidade: Atraso de {ativo.atrasoMinutos}m.
                  </div>
                )}
              </div>

              <button onClick={() => onCheckOut(ativo.id, simDate)} className="w-full py-6 mt-8 mb-2 rounded-[32px] bg-gradient-to-br from-rose-500 to-red-600 text-white font-black text-2xl shadow-[0_0_40px_rgba(225,29,72,0.4)] hover:scale-105 active:scale-95 transition-all">
                FINALIZAR TURNO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TELA: AUDITORIA (OS)
// ==========================================
function TabOS({ apontamentos, postos, prestadoras, unidades }: any) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-2xl h-full flex flex-col fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-100 flex items-center gap-4 tracking-tight">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl"><LayoutDashboard className="w-6 h-6 text-cyan-400" /></div>
            Auditoria de Faturamento
          </h2>
          <p className="text-base text-slate-400 mt-2">Motor de transações de campo e cálculo contábil autônomo.</p>
        </div>
        <div className="relative group">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
          <input type="text" placeholder="Buscar técnico ou data..." className="bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-base text-slate-200 focus:border-cyan-400/50 outline-none w-80 transition-all shadow-inner focus:shadow-[0_0_15px_rgba(34,211,238,0.1)]" />
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-2xl border border-slate-800/80 bg-slate-950/50 shadow-inner relative">
        <table className="w-full text-left border-collapse whitespace-nowrap relative">
          <thead className="sticky top-0 z-20">
            {/* Pseudo-element for blur so the table text doesn't mix with header background */}
            <tr>
              <th colSpan={6} className="p-0 border-b border-slate-800 h-14 bg-slate-950/80 backdrop-blur-xl absolute inset-0 z-[-1]" />
            </tr>
            <tr className="text-slate-400 text-xs uppercase tracking-widest relative z-10">
              <th className="p-5 font-bold">Status</th>
              <th className="p-5 font-bold">Data</th>
              <th className="p-5 font-bold">Técnico</th>
              <th className="p-5 font-bold">Local / Serviço</th>
              <th className="p-5 font-bold">Prestadora</th>
              <th className="p-5 font-bold text-right pr-8">Faturamento Final</th>
            </tr>
          </thead>
          <tbody className="text-base">
            {apontamentos.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-slate-500">Nenhum apontamento registrado.</td></tr>
            )}
            {apontamentos.map((ap: Apontamento) => {
              const posto = postos.find((p:any) => p.id === ap.postoId);
              const unidade = unidades.find((u:any) => u.id === posto?.unidadeId);
              const empresa = prestadoras.find((pr:any) => pr.id === posto?.prestadoraId);
              const dt = new Date(ap.checkIn);
              
              return (
                <tr key={ap.id} className="border-b border-slate-800/50 hover:bg-slate-900/80 hover:text-white transition-colors group cursor-default relative">
                  {/* Glowing left edge on hover */}
                  <td className="p-0 absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-cyan-500 transition-colors" />
                  
                  <td className="p-5 pl-6">
                    {ap.status === 'Em Andamento' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm"><Clock className="w-4 h-4"/> Operando</span>}
                    {ap.status === 'Faturado' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"><CheckCircle2 className="w-4 h-4"/> Pago</span>}
                    {ap.status === 'Falta' && <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm"><XCircle className="w-4 h-4"/> Glosa</span>}
                  </td>
                  <td className="p-5 text-slate-400 font-mono text-sm">{dt.toLocaleDateString('pt-BR')}</td>
                  <td className="p-5 text-slate-200 font-semibold">{ap.tecnico}</td>
                  <td className="p-5">
                    <p className="text-slate-200 text-sm font-bold">{unidade?.nome}</p>
                    <p className="text-slate-500 text-xs mt-1">{posto?.nome}</p>
                  </td>
                  <td className="p-5 text-slate-400 text-sm font-mono">{empresa?.nome || '-'}</td>
                  <td className="p-5 text-right pr-8">
                    {ap.status === 'Em Andamento' ? (
                      <span className="text-slate-600 font-mono text-sm">-</span>
                    ) : (
                      <div className="flex flex-col items-end justify-center group/tooltip relative">
                        <span className={`font-mono font-bold text-lg transition-transform ${ap.status === 'Falta' ? 'text-rose-500' : 'text-emerald-400'}`}>
                          {formatMoney(ap.valorFaturado)}
                        </span>
                        
                        {ap.descontoCalculado > 0 && (
                          <div className="flex flex-col items-end mt-1.5">
                            <div className="flex items-center gap-2 text-xs text-slate-500 line-through decoration-rose-500/50 cursor-help" title={`Cálculo Original: R$ ${ap.valorOriginal?.toFixed(2)}\nDesconto: R$ ${ap.descontoCalculado.toFixed(2)}`}>
                              {formatMoney(ap.valorOriginal)} <Info className="w-4 h-4 text-slate-600 group-hover/tooltip:text-slate-300 transition-colors" />
                            </div>
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-md mt-1 shadow-sm">
                              {ap.falta ? "Falta Integral" : `Atraso: ${ap.atrasoMinutos}m`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
