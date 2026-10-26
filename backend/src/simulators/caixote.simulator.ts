import type { SimuladorBanco } from "./simulator.interface.js";
import type { EntradaSimulacao, SaidaSimulacao } from "../types/simulation.js";
import { atrasoAleatorio } from "../utils/delay.js";
import { calcularParcelaPrice, arredondar } from "../utils/finance.js";

export class BancoCaixote implements SimuladorBanco {
  readonly nome = "Banco Caixote";
  private readonly TAXA = 0.0145; // 1.45% ao mês

  
  private async chamarApi(dados: EntradaSimulacao) {
    await atrasoAleatorio();

    
    if (dados.cpf.endsWith("0")) {
      throw new Error("Sistema do Caixote retornou Erro 503.");
    }

   
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
        motivo: resposta.detalhe || "Reprovado pelas políticas do banco"
      };
    }

    // Se aprovou, faz a matemática financeira
    const valorParcela = calcularParcelaPrice(entrada.valorEmprestimo, resposta.taxa_operacao!, entrada.parcelas);
    
    // CORREÇÃO 1 e 2: Validação da Margem Consignável (30% do salário)
    const margemMaxima = arredondar(entrada.salario * 0.30);
    
    if (valorParcela > margemMaxima) {
      return {
        banco: this.nome,
        status: "Reprovado",
        motivo: `A parcela de R$ ${valorParcela.toFixed(2)} excede a margem consignável máxima de R$ ${margemMaxima.toFixed(2)} (30% do salário).`
      };
    }

    // Passou na margem, então finaliza a proposta
    const valorTotal = arredondar(valorParcela * entrada.parcelas);

    return {
      banco: this.nome,
      status: "Aprovado",
      taxaJurosMensal: resposta.taxa_operacao!,
      valorParcela,
      valorTotal
    };
  }
}