import { Posto, Apontamento } from '../types';

export const toPostoDB = (p: Partial<Posto>) => ({
  id: p.id, prestadora_id: p.prestadoraId, nome: p.nome, faturamento: p.faturamento,
  escala_id: p.escalaId || null, servicos_ids: p.servicosIds || [], qtd_diurno: p.qtdDiurno || 1, qtd_noturno: p.qtdNoturno || 1,
  tem_diurno: p.temDiurno, hora_inicio_diurno: p.horaInicioDiurno, hora_fim_diurno: p.horaFimDiurno, valor_diurno: p.valorDiurno,
  tem_noturno: p.temNoturno, hora_inicio_noturno: p.horaInicioNoturno, hora_fim_noturno: p.horaFimNoturno, valor_noturno: p.valorNoturno
});
export const fromPostoDB = (d: any): Posto => ({
  id: d.id, prestadoraId: d.prestadora_id, nome: d.nome, faturamento: d.faturamento,
  escalaId: d.escala_id, servicosIds: d.servicos_ids || [], qtdDiurno: d.qtd_diurno || 1, qtdNoturno: d.qtd_noturno || 1,
  temDiurno: d.tem_diurno, horaInicioDiurno: d.hora_inicio_diurno, horaFimDiurno: d.hora_fim_diurno, valorDiurno: d.valor_diurno,
  temNoturno: d.tem_noturno, horaInicioNoturno: d.hora_inicio_noturno, horaFimNoturno: d.hora_fim_noturno, valorNoturno: d.valor_noturno,
  codigoSequencial: d.codigo_sequencial
});
export const toApontDB = (a: Apontamento) => ({
  id: a.id, posto_id: a.postoId, tecnico: a.tecnico, check_in: a.checkIn, check_out: a.checkOut,
  falta: a.falta, atraso_minutos: a.atrasoMinutos, valor_original: a.valorOriginal, desconto_calculado: a.descontoCalculado,
  valor_faturado: a.valorFaturado, status: a.status, foto_url: a.fotoUrl || null, turno_realizado: a.turnoRealizado || null, servico_id: a.servicoId || null,
  tratado_por: a.tratadoPor || null, observacao_tratamento: a.observacaoTratamento || null
});
export const fromApontDB = (d: any): Apontamento => ({
  id: d.id, postoId: d.posto_id, tecnico: d.tecnico, checkIn: d.check_in, checkOut: d.check_out,
  falta: d.falta, atrasoMinutos: d.atraso_minutos, valorOriginal: d.valor_original, descontoCalculado: d.desconto_calculado,
  valorFaturado: d.valor_faturado, status: d.status, fotoUrl: d.foto_url, turnoRealizado: d.turno_realizado, servicoId: d.servico_id,
  tratadoPor: d.tratado_por, observacaoTratamento: d.observacao_tratamento
});
