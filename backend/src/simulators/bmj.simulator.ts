import type { SimuladorBanco } from "./simulator.interface.js";
import type { EntradaSimulacao, SaidaSimulacao } from "../types/simulation.js";
import { atrasoAleatorio } from "../utils/delay.js";
import { calcularParcelaPrice, arredondar } from "../utils/finance.js";

export class BancoBMJ implements SimuladorBanco {
  readonly nome = "Banco BMJ";
  private readonly TAXA = 0.021; // 2.1% ao mês

  // 1. Simula a chamada a uma API externa (com formato de resposta próprio do BMJ)
  private async chamarApi(dados: EntradaSimulacao) {
    await atrasoAleatorio(); // Finge que demorou
    
    return {
      resultado_analise: "APROVADO",
      juros_aplicado: this.TAXA,
    };
  }

  // 2. O método obrigatório da interface que "traduz" a resposta
  async simular(entrada: EntradaSimulacao): Promise<SaidaSimulacao> {
    const respostaBruta = await this.chamarApi(entrada);

    const valorParcela = calcularParcelaPrice(entrada.valorEmprestimo, respostaBruta.juros_aplicado, entrada.parcelas);
    const valorTotal = arredondar(valorParcela * entrada.parcelas);

    return {
      banco: this.nome,
      status: "Aprovado",
      taxaJurosMensal: respostaBruta.juros_aplicado,
      valorParcela,
      valorTotal
    };
  }
}