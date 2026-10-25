export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

// (Tabela Price)
export function calcularParcelaPrice(valorEmprestimo: number, taxaMensal: number, parcelas: number): number {
  if (taxaMensal === 0) return arredondar(valorEmprestimo / parcelas);
  const parcela = valorEmprestimo * (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) / (Math.pow(1 + taxaMensal, parcelas) - 1);
  return arredondar(parcela);
}