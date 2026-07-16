export type Faturamento = 'Diário' | 'Mensal';
export type StatusOS = 'Em Andamento' | 'Medido' | 'Falta';

export interface Prestadora { id: string; cnpj: string; nome: string; }
export interface Servico { id: string; nome: string; }
export interface Escala { id: string; nome: string; carga_horaria: number; }

export interface Posto {
  id: string; prestadoraId: string | null; nome: string; faturamento: Faturamento;
  escalaId: string | null; servicosIds: string[]; qtdDiurno: number; qtdNoturno: number;
  temDiurno: boolean; horaInicioDiurno: string; horaFimDiurno: string; valorDiurno: number | null;
  temNoturno: boolean;  horaInicioNoturno?: string;
  horaFimNoturno?: string;
  valorNoturno?: number | null;
  codigoSequencial?: number;
}
export interface Apontamento {
  id: string; postoId: string; tecnico: string; checkIn: string; checkOut: string | null;
  falta: boolean; atrasoMinutos: number; valorOriginal: number | null; descontoCalculado: number; valorFaturado: number | null; status: StatusOS;
  fotoUrl?: string | null; turnoRealizado?: string | null; servicoId?: string | null;
  tratadoPor?: string;
  observacaoTratamento?: string;
}

export interface Perfil {
  id?: string;
  email: string;
  role: 'MASTER' | 'OPERADOR';
  telas_permitidas: string[];
}