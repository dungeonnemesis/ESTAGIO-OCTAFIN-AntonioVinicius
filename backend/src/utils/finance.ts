export function calcularParcelaPrice(valorPresente: number, taxaMensal: number, meses: number): number {
  if (meses <= 0) return 0;
  
  const taxaDecimal = taxaMensal; // Assumindo que recebe 0.0145 para 1.45%
  
  if (taxaDecimal === 0) {
    return Math.round((valorPresente / meses) * 100) / 100;
  }
  
  const fator = Math.pow(1 + taxaDecimal, meses);
  const parcela = valorPresente * ((taxaDecimal * fator) / (fator - 1));
  
  // Arredondamento para 2 casas decimais (Padrão monetário)
  return Math.round(parcela * 100) / 100;
}

// Adicione esta função para que os simuladores consigam importá-la corretamente
export function arredondar(valor: number): number {
  return Number(valor.toFixed(2));
}