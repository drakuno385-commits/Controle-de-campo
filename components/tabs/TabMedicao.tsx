import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Posto, Apontamento, Prestadora } from '@/types';
import { formatMoney } from '@/utils/formatters';
import { Briefcase, AlertTriangle, BadgeDollarSign, TrendingDown, Download } from 'lucide-react';

interface TabMedicaoProps {
  apontamentos: Apontamento[];
  prestadoras: Prestadora[];
  postos: Posto[];
}

const COLORS = ['#00f3ff', '#f5a623', '#ef4444', '#3b82f6'];

export default function TabMedicao({ apontamentos, prestadoras, postos }: TabMedicaoProps) {
  const [filtroEmpresa, setFiltroEmpresa] = React.useState<string>('');
  const [filtroPosto, setFiltroPosto] = React.useState<string>('');

  const data = useMemo(() => {
    let bruto = 0;
    let descontos = 0;
    let liquido = 0;
    
    let normalCount = 0;
    let atrasoCount = 0;
    let faltaCount = 0;

    // Agrupamento por Empresa
    const empresaMap: Record<string, { nome: string; bruto: number; desconto: number; liquido: number }> = {};

    prestadoras.forEach(p => {
      empresaMap[p.id!] = { nome: p.nome, bruto: 0, desconto: 0, liquido: 0 };
    });

    const filteredApontamentos = apontamentos.filter(a => {
       if (filtroPosto && a.postoId !== filtroPosto) return false;
       if (filtroEmpresa) {
          const posto = postos.find(p => p.id === a.postoId);
          if (posto?.prestadoraId !== filtroEmpresa) return false;
       }
       return true;
    });

    filteredApontamentos.forEach(a => {
      // Ignora se não finalizado ou sem posto
      if (a.status === 'Em Andamento') return;
      
      const posto = postos.find(p => p.id === a.postoId);
      if (!posto) return;
      
      const pid = a.prestadoraId || posto.prestadoraId;
      if (!pid) return;

      if (!empresaMap[pid]) empresaMap[pid] = { nome: 'Desconhecida', bruto: 0, desconto: 0, liquido: 0 };

      // Valores
      const vOri = a.valorOriginal || 0;
      const vDesc = a.descontoCalculado || 0;
      const vFat = a.valorFaturado || 0;

      bruto += vOri;
      descontos += vDesc;
      liquido += vFat;

      empresaMap[pid].bruto += vOri;
      empresaMap[pid].desconto += vDesc;
      empresaMap[pid].liquido += vFat;

      // Assiduidade
      if (a.falta) faltaCount++;
      else if (a.atrasoMinutos > 0) atrasoCount++;
      else normalCount++;
    });

    const chartData = Object.values(empresaMap).filter(e => e.bruto > 0);
    
    const pieData = [
      { name: 'Normal', value: normalCount },
      { name: 'Atrasos', value: atrasoCount },
      { name: 'Faltas', value: faltaCount },
    ].filter(item => item.value > 0);

    return { bruto, descontos, liquido, chartData, pieData, totalTurnos: normalCount + atrasoCount + faltaCount, rawMap: empresaMap };
  }, [apontamentos, prestadoras, postos, filtroEmpresa, filtroPosto]);

  const exportarRelatorio = () => {
    // Cabeçalho do CSV
    let csvContent = "Prestadora;Posto;Dias Previstos;Dias Realizados;Valor Previsto;Descontos;Valor Real a Faturar\n";
    
    prestadoras.forEach(prestadora => {
      // Find all unique postos that have apontamentos for this prestadora
      const apontamentosDaPrestadora = apontamentos.filter(a => 
        (a.prestadoraId === prestadora.id || (!a.prestadoraId && postos.find(p => p.id === a.postoId)?.prestadoraId === prestadora.id)) 
        && a.status !== 'Em Andamento'
      );

      // Group these apontamentos by Posto for the CSV rows
      const postosIds = Array.from(new Set(apontamentosDaPrestadora.map(a => a.postoId)));

      postosIds.forEach(pId => {
        const posto = postos.find(p => p.id === pId);
        if (!posto) return;

        const apontamentosDoPosto = apontamentosDaPrestadora.filter(a => a.postoId === pId);
        if (apontamentosDoPosto.length === 0) return;

      const diasPrevistos = apontamentosDoPosto.length;
      const diasRealizados = apontamentosDoPosto.filter(a => !a.falta).length;
      
      const valorPrevisto = apontamentosDoPosto.reduce((acc, a) => acc + (a.valorOriginal || 0), 0);
      const descontos = apontamentosDoPosto.reduce((acc, a) => acc + (a.descontoCalculado || 0), 0);
      const valorReal = apontamentosDoPosto.reduce((acc, a) => acc + (a.valorFaturado || 0), 0);

      const fPrevisto = valorPrevisto.toFixed(2).replace('.', ',');
      const fDescontos = descontos.toFixed(2).replace('.', ',');
      const fReal = valorReal.toFixed(2).replace('.', ',');

        csvContent += `${prestadora.nome};${posto.nome};${diasPrevistos};${diasRealizados};R$ ${fPrevisto};R$ ${fDescontos};R$ ${fReal}\n`;
      });
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_medicao_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full fade-in pb-2">
      <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">Medição de Pagamentos</h2>
          <p className="text-slate-400 mt-1">Fechamento financeiro dos prestadores terceirizados.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={filtroEmpresa} 
            onChange={e => {setFiltroEmpresa(e.target.value); setFiltroPosto('');}}
            className="bg-[#0A1120]/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-cyan-400 outline-none w-56"
          >
            <option value="">Todas as Empresas</option>
            {prestadoras.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>
          <select 
            value={filtroPosto} 
            onChange={e => setFiltroPosto(e.target.value)}
            className="bg-[#0A1120]/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-cyan-400 outline-none w-56"
          >
            <option value="">Todos os Postos</option>
            {postos.filter(p => !filtroEmpresa || p.prestadoraId === filtroEmpresa).map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>

          <button onClick={exportarRelatorio} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-slate-700">
            <Download className="w-4 h-4 text-cyan-400" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4">
        {/* KPIs Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl relative overflow-hidden group shadow-lg backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-[30px] -mr-8 -mt-8 transition-transform group-hover:scale-150" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Faturamento Devido</p>
                <h3 className="text-2xl font-black text-white">{formatMoney(data.bruto)}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl relative overflow-hidden group shadow-lg backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-[30px] -mr-8 -mt-8 transition-transform group-hover:scale-150" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Descontos Aplicados</p>
                <h3 className="text-2xl font-black text-red-400">{formatMoney(data.descontos)}</h3>
                <p className="text-[10px] text-red-500/60 font-bold uppercase mt-1">Faltas e Atrasos</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 border border-red-500/30">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl relative overflow-hidden group shadow-lg backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[30px] -mr-8 -mt-8 transition-transform group-hover:scale-150" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Líquido a Pagar</p>
                <h3 className="text-2xl font-black text-emerald-400">{formatMoney(data.liquido)}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                <BadgeDollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Gráfico de Barras: Valores a pagar por Empresa */}
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-lg backdrop-blur-md flex flex-col min-h-0">
            <h3 className="text-base font-bold text-white mb-4 shrink-0">Valores a Pagar por Empresa (Prestadora)</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBruto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#00f3ff" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorLiquido" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f5a623" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#f5a623" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                  <XAxis dataKey="nome" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} tickLine={false} axisLine={{stroke: '#334155'}} />
                  <YAxis width={65} stroke="#475569" tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => `R$ ${val/1000}k`} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(0, 243, 255, 0.04)'}}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(0, 243, 255, 0.2)', borderRadius: '12px', color: '#f1f5f9', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                    formatter={(value: any) => formatMoney(Number(value))}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} iconType="circle" />
                  <Bar dataKey="bruto" name="Devido (Bruto)" fill="url(#colorBruto)" radius={[4, 4, 0, 0]} barSize={25} />
                  <Bar dataKey="liquido" name="A Pagar (Líquido)" fill="url(#colorLiquido)" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Pizza: Ocorrências / Assiduidade */}
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-lg backdrop-blur-md flex flex-col min-h-0">
            <h3 className="text-base font-bold text-white mb-4 shrink-0">Assiduidade Geral</h3>
            <div className="flex-1 relative min-h-0">
              {data.totalTurnos === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-semibold">
                  Sem dados suficientes
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {data.pieData.map((entry, index) => (
                        <linearGradient key={`grad-${index}`} id={`gradPie-${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1}/>
                          <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={data.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={6}
                    >
                      {data.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#gradPie-${index})`} className="drop-shadow-lg" />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-3 bg-[#0A1120]/60 p-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center border border-white/5 shrink-0">
              Total de {data.totalTurnos} turnos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}