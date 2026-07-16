import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, CheckCircle2, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { Posto, Apontamento, Perfil } from '@/types';

interface TabMonitoramentoProps {
  postos: Posto[];
  apontamentos: Apontamento[];
  currentUser: Perfil | null;
  onTratarOcorrencia: (postoId: string, observacao: string) => void;
}

interface MonitoramentoStatus {
  posto: Posto;
  estado: 'Normal' | 'Alerta Atraso' | 'Falta Crítica';
  ultimaBatida?: Apontamento;
  minutosAtraso: number;
}

export default function TabMonitoramento({ postos, apontamentos, currentUser, onTratarOcorrencia }: TabMonitoramentoProps) {
  const [statusList, setStatusList] = useState<MonitoramentoStatus[]>([]);
  const [now, setNow] = useState(new Date());
  const [filtro, setFiltro] = useState<'Todos' | 'Ocorrências' | 'Normal'>('Todos');

  // Atualiza o relógio a cada minuto para o monitoramento ao vivo
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const todayStr = now.toISOString().substring(0, 10);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const newStatusList = postos.map(posto => {
      // Pega apontamentos de hoje para este posto
      const batidasHoje = apontamentos.filter(a => a.postoId === posto.id && a.checkIn.startsWith(todayStr));
      
      let estado: MonitoramentoStatus['estado'] = 'Normal';
      let minutosAtraso = 0;

      // Simplificação da regra: se o posto tem jornada diurna e já passou da hora + 15 min de tolerância
      if (posto.temDiurno && posto.horaInicioDiurno) {
        const [h, m] = posto.horaInicioDiurno.split(':').map(Number);
        const expectedMin = h * 60 + m;
        
        // Verifica se alguém bateu o ponto
        const checkinDiurno = batidasHoje.find(a => {
          const checkInDate = new Date(a.checkIn);
          const cMins = checkInDate.getHours() * 60 + checkInDate.getMinutes();
          return Math.abs(cMins - expectedMin) < 240; // Batida na janela do diurno (4 horas)
        });

        if (!checkinDiurno && currentMinutes > expectedMin + 15) { // 15 minutos de tolerância para alertar
          estado = currentMinutes > expectedMin + 120 ? 'Falta Crítica' : 'Alerta Atraso';
          minutosAtraso = currentMinutes - expectedMin;
        }
      }

      // Se passou a janela do noturno (após 18h)
      if (posto.temNoturno && posto.horaInicioNoturno) {
        const [h, m] = posto.horaInicioNoturno.split(':').map(Number);
        const expectedMin = h * 60 + m;
        
        // Só dispara alerta noturno se a hora atual for maior que a esperada
        if (currentMinutes > expectedMin + 15 && currentMinutes < expectedMin + 300) { // janela da noite
          const checkinNoturno = batidasHoje.find(a => {
            const checkInDate = new Date(a.checkIn);
            const cMins = checkInDate.getHours() * 60 + checkInDate.getMinutes();
            return Math.abs(cMins - expectedMin) < 240; 
          });

          if (!checkinNoturno) {
            estado = currentMinutes > expectedMin + 120 ? 'Falta Crítica' : 'Alerta Atraso';
            minutosAtraso = currentMinutes - expectedMin;
          }
        }
      }

      return {
        posto,
        estado,
        ultimaBatida: batidasHoje[0], // Mais recente (assumindo que a lista vem ordenada desc)
        minutosAtraso
      };
    });

    // Ordenar: Faltas e Atrasos primeiro
    newStatusList.sort((a, b) => {
      if (a.estado === 'Falta Crítica' && b.estado !== 'Falta Crítica') return -1;
      if (b.estado === 'Falta Crítica' && a.estado !== 'Falta Crítica') return 1;
      if (a.estado === 'Alerta Atraso' && b.estado !== 'Alerta Atraso') return -1;
      if (b.estado === 'Alerta Atraso' && a.estado !== 'Alerta Atraso') return 1;
      return 0;
    });

    setStatusList(newStatusList);
  }, [postos, apontamentos, now]);

  const handleTratar = (postoId: string) => {
    const obs = prompt("Informe a justificativa/observação para tratamento manual:");
    if (obs) {
      onTratarOcorrencia(postoId, obs);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin-slow" /> Monitoramento Operacional (CCO)
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Status em tempo real da entrada dos vigilantes/porteiros nos Postos.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
          <button onClick={() => setFiltro('Todos')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filtro === 'Todos' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>Todos</button>
          <button onClick={() => setFiltro('Ocorrências')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filtro === 'Ocorrências' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>Ocorrências</button>
          <button onClick={() => setFiltro('Normal')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filtro === 'Normal' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>Normal</button>
        </div>
        <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-sm font-mono flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {now.toLocaleTimeString('pt-BR')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statusList
          .filter(s => {
            if (filtro === 'Ocorrências') return s.estado !== 'Normal';
            if (filtro === 'Normal') return s.estado === 'Normal';
            return true;
          })
          .map((status, idx) => (
          <div key={status.posto.id + idx} className={`p-6 rounded-2xl border backdrop-blur-md transition-all flex flex-col justify-between ${
            status.estado === 'Falta Crítica' ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50' : 
            status.estado === 'Alerta Atraso' ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50' :
            'bg-slate-900/40 border-slate-800/80 hover:border-cyan-400/30'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-200">{status.posto.nome}</h3>
                <p className="text-xs text-slate-500">Cód: #{status.posto.codigoSequencial || '---'}</p>
              </div>
              <div className="flex gap-2 items-center">
                {status.apontamentoAtual?.fotoUrl && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    <img src={status.apontamentoAtual.fotoUrl} alt="Foto Check-in" className="w-full h-full object-cover" />
                  </div>
                )}
                {status.estado === 'Falta Crítica' && <AlertTriangle className="text-red-500 animate-pulse" />}
                {status.estado === 'Alerta Atraso' && <Clock className="text-amber-500 animate-pulse" />}
                {status.estado === 'Normal' && <CheckCircle2 className="text-emerald-500" />}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4" /> Sem restrições de local
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" /> 
                Diurno: {status.posto.temDiurno ? status.posto.horaInicioDiurno : '---'} | Noturno: {status.posto.temNoturno ? status.posto.horaInicioNoturno : '---'}
              </div>

              {status.estado !== 'Normal' ? (
                <div className={`mt-4 p-3 rounded-lg flex flex-col gap-3 ${status.estado === 'Falta Crítica' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  <div className="font-bold">
                    {status.estado === 'Falta Crítica' ? 'Falta Presumida' : 'Atraso Detectado'} ({status.minutosAtraso} min)
                  </div>
                  <button 
                    onClick={() => handleTratar(status.posto.id)}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Tratar Ocorrência Manual
                  </button>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-emerald-500/10 text-emerald-400 rounded-lg flex flex-col">
                  <span className="font-bold">Operação Normal</span>
                  {status.ultimaBatida && (
                    <span className="text-xs text-emerald-500/80 mt-1">Última batida: {new Date(status.ultimaBatida.checkIn).toLocaleTimeString('pt-BR')} ({status.ultimaBatida.tecnico})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {statusList.length === 0 && (
          <div className="col-span-full p-10 text-center text-slate-500 border border-slate-800 border-dashed rounded-2xl">
            Nenhum posto monitorado no momento. Vincule os postos às escalas.
          </div>
        )}
      </div>
    </div>
  );
}
