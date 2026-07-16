export const formatMoney = (val: number | null) => val !== null ? `R$ ${val.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}` : '-';
