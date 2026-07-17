import React, { useMemo, useState } from 'react';
import { 
  Building2, MapPin, BadgeDollarSign, Link2, TrendingUp, TrendingDown, Clock, ChevronRight, Activity, Briefcase
} from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Bar, Cell, Legend } from 'recharts';
import { Prestadora, Posto, Apontamento } from '../../types';
import { formatMoney } from '../../utils/formatters';

interface Props {
  prestadoras: Prestadora[];
  postos: Posto[];
  apontamentos: Apontamento[];
  onNavigate: (tab: string) => void;
}

export default function TabVisaoGeral({ prestadoras, postos, apontamentos, onNavigate }: Props) {
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('');
  const [filtroPosto, setFiltroPosto] = useState<string>('');
  
  // Calculation of KPIs and Chart Data
  const kpis = useMemo(() => {
    let devido = 0;
    let descontos = 0;
    let liquido = 0;
    
    // Group by month
    const monthsData: Record<string, { liquido: number, devido: number }> = {};
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    // Initialize last 6 months
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      monthsData[`${m.getFullYear()}-${m.getMonth()}`] = { liquido: 0, devido: 0 };
    }

    const filteredApontamentos = apontamentos.filter(a => {
       if (filtroPosto && a.postoId !== filtroPosto) return false;
       if (filtroEmpresa) {
          const postoInfo = postos.find(p => p.id === a.postoId);
          if (postoInfo?.prestadoraId !== filtroEmpresa) return false;
       }
       return true;
    });

    filteredApontamentos.forEach(a => {
      if (a.status !== 'Em Andamento') {
         const dev = a.valorOriginal || 0;
         const desc = a.descontoCalculado || 0;
         const liq = a.valorFaturado || (dev - desc);
         
         devido += dev;
         descontos += desc;
         liquido += liq;

         if (a.checkIn) {
           const date = new Date(a.checkIn);
           const key = `${date.getFullYear()}-${date.getMonth()}`;
           if (monthsData[key]) {
              monthsData[key].devido += dev;
              monthsData[key].liquido += liq;
           }
         }
      }
    });

    const chartData = Object.keys(monthsData).map(k => {
      const [, m] = k.split('-');
      return {
        name: monthNames[parseInt(m)],
        liquido: monthsData[k].liquido,
        devido: monthsData[k].devido
      };
    });

    return { devido, descontos, liquido, chartData };
  }, [apontamentos, filtroEmpresa, filtroPosto, postos]);

  const pendentesVinculo = postos.filter(p => !p.prestadoraId);
  const empresasAtivas = prestadoras.filter(p => !filtroEmpresa || p.id === filtroEmpresa).slice(0, 3);
  const postosAtivos = postos.filter(p => {
    if (filtroPosto && p.id !== filtroPosto) return false;
    if (filtroEmpresa && p.prestadoraId !== filtroEmpresa) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full fade-in">
      
      {/* FILTER BAR */}
      <div className="flex gap-4 mb-4 shrink-0">
        <select 
          value={filtroEmpresa} 
          onChange={e => {setFiltroEmpresa(e.target.value); setFiltroPosto('');}}
          className="bg-[#0A1120]/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-cyan-400 outline-none w-64"
        >
          <option value="">Todas as Empresas</option>
          {prestadoras.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.nome}</option>
          ))}
        </select>
        <select 
          value={filtroPosto} 
          onChange={e => setFiltroPosto(e.target.value)}
          className="bg-[#0A1120]/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-cyan-400 outline-none w-64"
        >
          <option value="">Todos os Postos</option>
          {postos.filter(p => !filtroEmpresa || p.prestadoraId === filtroEmpresa).map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>

      {/* DASHBOARD GRID (Fits Screen) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-3 xl:grid-rows-2 gap-4 pb-2">
        
        {/* WIDGET 1: EMPRESAS */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-2xl flex flex-col group relative overflow-hidden transition-all hover:bg-white/[0.03] min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" /> Empresas
              </h3>
            </div>
            <button onClick={() => onNavigate('empresas')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {empresasAtivas.length === 0 ? <p className="text-slate-500 text-sm">Nenhuma empresa.</p> : null}
            {empresasAtivas.map(e => (
              <div key={e.id} className="flex items-center gap-4 bg-[#0A1120]/40 p-3 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors cursor-default">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-slate-200 font-bold text-sm truncate">{e.nome}</h4>
                  <p className="text-slate-500 font-mono text-[10px] truncate">{e.cnpj}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WIDGET 2: POSTOS */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-2xl flex flex-col group relative overflow-hidden transition-all hover:bg-white/[0.03] min-h-0">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" /> Operações
              </h3>
            </div>
            <button onClick={() => onNavigate('postos')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-2 relative min-h-0">
            <div className="w-24 h-24 rounded-full border-[6px] border-slate-800 flex items-center justify-center mb-3 relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-[#0A1120] shrink-0">
               <span className="text-3xl font-black text-white">{postosAtivos.length}</span>
               <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="47" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray="289" strokeDashoffset="40" strokeLinecap="round" />
               </svg>
            </div>
            <p className="text-xs font-bold text-slate-400 shrink-0">Total de Operações</p>
            
            {postosAtivos[0] && (
              <div className="w-full mt-3 bg-[#0A1120]/40 p-2.5 rounded-xl border border-white/5 flex justify-between items-center shrink-0">
                <span className="text-xs font-bold text-slate-300 truncate pr-2">{postosAtivos[0].nome}</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded-lg">R$ {postosAtivos[0].valorDiurno || 0}</span>
              </div>
            )}
          </div>
        </div>

        {/* WIDGET 3: MEDIÇÃO E KPIs */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-2xl flex flex-col group relative overflow-hidden transition-all hover:bg-white/[0.03] min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <BadgeDollarSign className="w-5 h-5 text-emerald-400" /> Financeiro
              </h3>
            </div>
            <button onClick={() => onNavigate('medicao')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3 min-h-0">
            <div className="relative bg-[#0A1120]/60 p-3 rounded-xl border border-white/5 overflow-hidden group/kpi">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 blur-[20px] -mr-4 -mt-4" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 relative z-10">Devido (Bruto)</p>
              <h4 className="text-lg font-black text-white relative z-10">{formatMoney(kpis.devido)}</h4>
            </div>

            <div className="relative bg-[#0A1120]/60 p-3 rounded-xl border border-white/5 overflow-hidden group/kpi">
              <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 blur-[20px] -mr-4 -mt-4" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 relative z-10">Descontos</p>
              <h4 className="text-lg font-black text-rose-400 relative z-10">{formatMoney(kpis.descontos)}</h4>
            </div>

            <div className="relative bg-[#0A1120]/60 p-3 rounded-xl border border-white/5 overflow-hidden group/kpi">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-[20px] -mr-4 -mt-4" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 relative z-10">Líquido a Pagar</p>
              <h4 className="text-lg font-black text-emerald-400 relative z-10">{formatMoney(kpis.liquido)}</h4>
            </div>
          </div>
        </div>

        {/* WIDGET 4: VÍNCULOS PENDENTES */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-2xl flex flex-col group relative overflow-hidden transition-all hover:bg-white/[0.03] min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-rose-400" /> Pendências
              </h3>
            </div>
            <button onClick={() => onNavigate('vinculos')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {pendentesVinculo.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Activity className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-bold">Tudo em dia.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendentesVinculo.map(p => (
                  <div key={p.id} className="bg-[#0A1120]/60 border border-white/5 border-l-[3px] border-l-rose-500/80 p-2.5 rounded-xl flex justify-between items-center hover:border-l-rose-400 transition-colors">
                    <span className="text-xs font-bold text-slate-200 truncate pr-2">{p.nome}</span>
                    <span className="text-[9px] font-bold uppercase text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded shrink-0">Pendente</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* WIDGET 5: GRÁFICO RECHARTS */}
        <div className="xl:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-2xl flex flex-col group relative overflow-hidden transition-all hover:bg-white/[0.03] min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" /> Evolução Financeira
              </h3>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpis.chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDevido" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorLiq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.4} />
                <XAxis dataKey="name" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} tickLine={false} axisLine={{stroke: '#1e293b'}} />
                <YAxis width={90} stroke="#475569" tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(0, 243, 255, 0.03)'}}
                  contentStyle={{ backgroundColor: 'rgba(10, 17, 32, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#f1f5f9', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="devido" name="Bruto" fill="url(#colorDevido)" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="liquido" name="Líquido" fill="url(#colorLiq)" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
