import type { SimuladorBanco } from "./simulator.interface.js";
import type { EntradaSimulacao, SaidaSimulacao } from "../types/simulation.js";
import { atrasoAleatorio } from "../utils/delay.js";
import { calcularParcelaPrice, arredondar } from "../utils/finance.js";

export class BancoCaixote implements SimuladorBanco {
  readonly nome = "Banco Caixote";
  private readonly TAXA = 0.0145; // 1.45% ao mês

  // 1. A API do Caixote tem regras chatas e um formato diferente do BMJ
  private async chamarApi(dados: EntradaSimulacao) {
    await atrasoAleatorio();

    // REGRA EXIGIDA: Lança um erro (simula sistema fora do ar) se o CPF terminar em 0
    if (dados.cpf.endsWith("0")) {
      throw new Error("Sistema do Caixote retornou Erro 503.");
    }

    // REGRA EXIGIDA: Reprova automaticamente qualquer simulação acima de 48 meses
    if (dados.parcelas > 48) {
      return { aprovacao: false, detalhe: "O prazo máximo permitido é 48 meses." };
    }

    return { aprovacao: true, taxa_operacao: this.TAXA };
  }

  async simular(entrada: EntradaSimulacao): Promise<SaidaSimulacao> {
    const resposta = await this.chamarApi(entrada);

    // Se a API reprovou, não fazemos cálculos de juros. Só devolvemos o motivo.
    if (!resposta.aprovacao) {
      return {
        banco: this.nome,
        status: "Reprovado",
        motivo: resposta.detalhe
      };
    }

    // Se aprovou, faz a matemática financeira
    const valorParcela = calcularParcelaPrice(entrada.valorEmprestimo, resposta.taxa_operacao!, entrada.parcelas);
    const valorTotal = arredondar(valorParcela * entrada.parcelas);

    return {
      banco: this.nome,
      status: "Aprovado",
      taxaJurosMensal: resposta.taxa_operacao,
      valorParcela,
      valorTotal
    };
  }
}