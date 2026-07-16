import { create } from 'zustand';

export interface Prestadora {
  id: string;
  nome: string;
  cnpj: string;
}

export interface Unidade {
  id: string;
  nome: string;
  endereco: string;
}

export interface Posto {
  id: string;
  unidadeId: string;
  prestadoraId: string | null;
  tipo: string;
  
  diasAtendimento: string[];
  cargaHoraria: string; // "12x36", "8h", "6h"
  faturamento: "Diário" | "Mensal";
  
  temDiurno: boolean;
  horaInicioDiurno: string;
  horaFimDiurno: string;
  valorDiurno: number | null;
  
  temNoturno: boolean;
  horaInicioNoturno: string;
  horaFimNoturno: string;
  valorNoturno: number | null;
}

export interface Apontamento {
  id: string;
  postoId: string;
  tecnico: string;
  checkIn: string; // ISO string
  checkOut: string | null; // ISO string
  
  falta: boolean;
  atrasoMinutos: number;
  descontoCalculado: number;
  valorOriginal: number | null;
  valorFaturado: number | null; status?: string;
}

interface AppState {
  prestadoras: Prestadora[];
  unidades: Unidade[];
  postos: Posto[];
  apontamentos: Apontamento[];
  
  adicionarPrestadora: (p: Prestadora) => void;
  adicionarUnidade: (u: Unidade) => void;
  adicionarPosto: (p: Posto) => void;
  vincularPosto: (postoId: string, prestadoraId: string) => void;
  desvincularPosto: (postoId: string) => void;
  registrarCheckIn: (a: Omit<Apontamento, 'checkOut' | 'valorOriginal' | 'valorFaturado' | 'descontoCalculado'>) => void;
  registrarCheckOut: (id: string, atrasoSimuladoMinutos?: number) => void;
  registrarFalta: (postoId: string, tecnico: string, dataFalta: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  prestadoras: [
    { id: "p1", nome: "Segurança Falcão", cnpj: "12.345.678/0001-90" },
    { id: "p2", nome: "GWEP Serviços", cnpj: "98.765.432/0001-10" }
  ],
  unidades: [
    { id: "u1", nome: "Condomínio Vista Azul", endereco: "Av Paulista, 1000" },
    { id: "u2", nome: "Hospital São João", endereco: "Rua das Laranjeiras, 50" }
  ],
  postos: [
    { id: "po1", unidadeId: "u1", prestadoraId: "p1", tipo: "Portaria", diasAtendimento: ["Seg","Ter","Qua","Qui","Sex","Sab","Dom"], cargaHoraria: "12x36", faturamento: "Mensal", temDiurno: true, horaInicioDiurno: "06:00", horaFimDiurno: "18:00", valorDiurno: 3000, temNoturno: false, horaInicioNoturno: "", horaFimNoturno: "", valorNoturno: null },
    { id: "po2", unidadeId: "u1", prestadoraId: "p2", tipo: "Vigilância Armada", diasAtendimento: ["Seg","Ter","Qua","Qui","Sex","Sab","Dom"], cargaHoraria: "12x36", faturamento: "Mensal", temDiurno: false, horaInicioDiurno: "", horaFimDiurno: "", valorDiurno: null, temNoturno: true, horaInicioNoturno: "18:00", horaFimNoturno: "06:00", valorNoturno: 4500 },
    { id: "po3", unidadeId: "u2", prestadoraId: null, tipo: "Limpeza Hospitalar", diasAtendimento: ["Seg","Ter","Qua","Qui","Sex"], cargaHoraria: "8h", faturamento: "Diário", temDiurno: true, horaInicioDiurno: "08:00", horaFimDiurno: "17:00", valorDiurno: 120, temNoturno: false, horaInicioNoturno: "", horaFimNoturno: "", valorNoturno: null },
  ],
  apontamentos: [],

  adicionarPrestadora: (p) => set((state) => ({ prestadoras: [...state.prestadoras, p] })),
  adicionarUnidade: (u) => set((state) => ({ unidades: [...state.unidades, u] })),
  adicionarPosto: (p) => set((state) => ({ postos: [...state.postos, p] })),
  
  vincularPosto: (postoId, prestadoraId) => set((state) => ({
    postos: state.postos.map(p => p.id === postoId ? { ...p, prestadoraId } : p)
  })),

  desvincularPosto: (postoId) => set((state) => ({
    postos: state.postos.map(p => p.id === postoId ? { ...p, prestadoraId: null } : p)
  })),

  registrarCheckIn: (a) => set((state) => {
    // Evita duplicidade de turno aberto para o mesmo técnico
    const hasOpen = state.apontamentos.some(ap => ap.tecnico === a.tecnico && ap.checkOut === null && !ap.falta);
    if (hasOpen) return state;

    // Evita bater o ponto mais de uma vez por dia no mesmo posto
    const checkInDay = a.checkIn.substring(0, 10);
    const hasCompletedToday = state.apontamentos.some(ap => 
      ap.tecnico === a.tecnico && 
      ap.postoId === a.postoId && 
      ap.checkIn.substring(0, 10) === checkInDay &&
      ap.checkOut !== null
    );
    if (hasCompletedToday) return state;

    const posto = state.postos.find(p => p.id === a.postoId);
    let atrasoCalculado = 0;

    if (posto) {
      const checkInDate = new Date(a.checkIn);
      const hCheckIn = checkInDate.getHours();
      const mCheckIn = checkInDate.getMinutes();
      const checkInAbsMin = hCheckIn * 60 + mCheckIn;
      
      let expectedAbsMin = checkInAbsMin; // Start with 0 delay assumption

      // Detect shift based on time
      if (hCheckIn >= 17 || hCheckIn < 6) { // Noturno
        if (posto.temNoturno && posto.horaInicioNoturno) {
          const [h, m] = posto.horaInicioNoturno.split(':').map(Number);
          expectedAbsMin = h * 60 + m;
          // Se começou ontem de noite e bateu ponto hoje de madrugada
          if (hCheckIn < 6 && h >= 17) {
            expectedAbsMin -= 24 * 60; // Desloca para o dia anterior matematicamente
          }
        }
      } else { // Diurno
        if (posto.temDiurno && posto.horaInicioDiurno) {
          const [h, m] = posto.horaInicioDiurno.split(':').map(Number);
          expectedAbsMin = h * 60 + m;
        }
      }

      let diff = checkInAbsMin - expectedAbsMin;
      // Tolerância de 5 minutos, ou só aceitar diff positivo
      if (diff > 0 && diff < 12 * 60) { // Ignora se for mais de 12 horas, provavelmente o turno errado
        atrasoCalculado = diff;
      }
    }

    return { 
      apontamentos: [{ 
        ...a, 
        atrasoMinutos: atrasoCalculado,
        checkOut: null, 
        valorOriginal: null, 
        valorFaturado: null, 
        descontoCalculado: 0 
      }, ...state.apontamentos] 
    };
  }),
  
  registrarCheckOut: (id, atrasoSimuladoMinutos = 0) => set((state) => {
    const apontamentosCopy = [...state.apontamentos];
    const apIndex = apontamentosCopy.findIndex(a => a.id === id);
    if (apIndex === -1) return state;

    const ap = { ...apontamentosCopy[apIndex] };
    const posto = state.postos.find(p => p.id === ap.postoId);

    if (posto) {
      const isFalta = ap.falta;
      if (atrasoSimuladoMinutos > 0) {
        ap.atrasoMinutos = atrasoSimuladoMinutos; // Override manual
      }
      
      const dayMapping = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
      const inDate = new Date(ap.checkIn);
      const diaDaSemana = dayMapping[inDate.getDay()];
      
      const diaConfigurado = posto.diasAtendimento.includes(diaDaSemana) || posto.diasAtendimento.length === 0;
      
      // Determina qual foi o turno trabalhado e o valor do contrato
      const hour = inDate.getHours();
      let valorBaseMensalOuDiario = 0;
      
      if (hour >= 17 || hour < 6) { // Noturno
        if (posto.temNoturno && posto.valorNoturno) {
          valorBaseMensalOuDiario = posto.valorNoturno;
        } else if (posto.temDiurno && posto.valorDiurno) {
          valorBaseMensalOuDiario = posto.valorDiurno;
        }
      } else { // Diurno
        if (posto.temDiurno && posto.valorDiurno) {
          valorBaseMensalOuDiario = posto.valorDiurno;
        } else if (posto.temNoturno && posto.valorNoturno) {
          valorBaseMensalOuDiario = posto.valorNoturno;
        }
      }

      // Se for Mensal, acha a diária dividindo sempre por 30 (Regra Fixa)
      const valorBaseDia = posto.faturamento === "Mensal" ? (valorBaseMensalOuDiario / 30) : valorBaseMensalOuDiario;

      let desconto = 0;

      if (diaConfigurado && valorBaseDia > 0) {
        if (isFalta) {
          desconto = valorBaseDia; // Desconta o dia inteiro
        } else if (ap.atrasoMinutos > 0) {
          // Desconto em horas
          const horasTurno = posto.cargaHoraria.includes("12x") ? 12 : 8;
          const valorHora = valorBaseDia / horasTurno;
          desconto = (ap.atrasoMinutos / 60) * valorHora;
        }
      }

      ap.valorOriginal = valorBaseDia;
      ap.descontoCalculado = Math.min(desconto, valorBaseDia); 
      ap.valorFaturado = valorBaseDia - ap.descontoCalculado;
      ap.checkOut = ap.checkOut || new Date().toISOString(); 
    }

    apontamentosCopy[apIndex] = ap;
    return { apontamentos: apontamentosCopy };
  }),

  registrarFalta: (postoId, tecnico, dataFalta) => set((state) => {
    // Evita múltiplas faltas no mesmo dia
    const hasFaltaHoje = state.apontamentos.some(ap => ap.tecnico === tecnico && ap.falta && ap.checkIn.substring(0,10) === dataFalta.substring(0,10));
    if (hasFaltaHoje) return state;

    const posto = state.postos.find(p => p.id === postoId);
    if (!posto) return state;

    const dayMapping = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const dt = new Date(dataFalta);
    const diaDaSemana = dayMapping[dt.getDay()];
    const diaConfigurado = posto.diasAtendimento.includes(diaDaSemana);

    const valorBaseMensalOuDiario = posto.valorDiurno || posto.valorNoturno || 0;
    const valorBaseDia = posto.faturamento === "Mensal" ? (valorBaseMensalOuDiario / 30) : valorBaseMensalOuDiario;
    let desconto = 0;
    
    if (diaConfigurado && valorBaseDia > 0) {
      desconto = valorBaseDia;
    }

    const novaFalta: Apontamento = {
      id: `ap-falta-${Date.now()}`,
      postoId,
      tecnico,
      checkIn: dataFalta,
      checkOut: dataFalta,
      falta: true,
      atrasoMinutos: 0,
      valorOriginal: valorBaseDia,
      descontoCalculado: desconto,
      valorFaturado: valorBaseDia - desconto
    };

    return { apontamentos: [novaFalta, ...state.apontamentos] };
  })
}));
