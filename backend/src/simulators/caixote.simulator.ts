import type { EntradaSimulacao, SaidaSimulacao } from "../types/simulation.js";
import type { SimuladorBanco } from "./simulator.interface.js";

export class BancoCaixote implements SimuladorBanco {
  readonly nome = "Banco Caixote";
  async simular(dados: EntradaSimulacao): Promise<SaidaSimulacao> {
    const TAXA_JUROS = 0.0145; // 1,45% ao mês
    const MARGEM_MAXIMA = dados.salario * 0.30;
    
    if (dados.parcelas > 48) {
      return {
        banco: "Banco Caixote",
        status: "Reprovado",
        taxaJurosMensal: TAXA_JUROS,
        valorParcela: 0,
        valorTotal: 0,
      };
    }

    // Cálculo da parcela com juros compostos (Tabela Price)
    const fator = Math.pow(1 + TAXA_JUROS, dados.parcelas);
    const valorParcela = dados.valorEmprestimo * ((TAXA_JUROS * fator) / (fator - 1));
    const valorTotal = valorParcela * dados.parcelas;

    const aprovado = valorParcela <= MARGEM_MAXIMA;

    return {
      banco: "Banco Caixote",
      status: aprovado ? "Aprovado" : "Reprovado",
      taxaJurosMensal: TAXA_JUROS,
      valorParcela: Number(valorParcela.toFixed(2)),
      valorTotal: Number(valorTotal.toFixed(2)),
    };
    }
}