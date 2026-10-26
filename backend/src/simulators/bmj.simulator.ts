import type { SimuladorBanco } from "./simulator.interface.js";
import type { EntradaSimulacao, SaidaSimulacao } from "../types/simulation.js";
import { atrasoAleatorio } from "../utils/delay.js";
import { calcularParcelaPrice, arredondar } from "../utils/finance.js";

export class BancoBMJ implements SimuladorBanco {
  readonly nome = "Banco BMJ";
  private readonly TAXA = 0.021; // 2.1% ao mês

  private async chamarApi(dados: EntradaSimulacao) {
    await atrasoAleatorio(); 
    
    if (dados.parcelas > 72) {
      return { aprovacao: false, detalhe: "O prazo máximo permitido é 72 meses." };
    }
    
    return {
      aprovacao: true,
      juros_aplicado: this.TAXA,
    };
  }

  async simular(entrada: EntradaSimulacao): Promise<SaidaSimulacao> {
    const respostaBruta = await this.chamarApi(entrada);

    if (!respostaBruta.aprovacao) {
      return {
        banco: this.nome,
        status: "Reprovado",
        motivo: respostaBruta.detalhe || "Reprovado pelas políticas do banco"
      };
    }

    const valorParcela = calcularParcelaPrice(entrada.valorEmprestimo, respostaBruta.juros_aplicado!, entrada.parcelas);
    
    // Validação da Margem Consignável (35% do salário)
    const margemMaxima = arredondar(entrada.salario * 0.35);

    if (valorParcela > margemMaxima) {
      return {
        banco: this.nome,
        status: "Reprovado",
        motivo: `A parcela de R$ ${valorParcela.toFixed(2)} excede a margem consignável máxima de R$ ${margemMaxima.toFixed(2)} (35% do salário).`
      };
    }

    const valorTotal = arredondar(valorParcela * entrada.parcelas);

    return {
      banco: this.nome,
      status: "Aprovado",
      taxaJurosMensal: respostaBruta.juros_aplicado!,
      valorParcela,
      valorTotal
    };
  }
}