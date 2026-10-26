import type { SimuladorBanco } from "../simulators/simulator.interface.js";
import type { EntradaSimulacao, SaidaSimulacao } from "../types/simulation.js";

export class SimulacaoService {
  private bancos: SimuladorBanco[];

  constructor(bancos: SimuladorBanco[]) {
    this.bancos = bancos;
  }

  async processarSimulacoes(dados: EntradaSimulacao): Promise<SaidaSimulacao[]> {
    const promessas = this.bancos.map(async (banco) => {
      let timerId: NodeJS.Timeout | string | number | undefined;

      // 1. Prepara o timeout e guarda a referência do timer
      const timeout = new Promise<never>((_, reject) => {
        timerId = setTimeout(() => reject(new Error("Timeout: O banco demorou mais de 3 segundos para responder.")), 3000);
      });

      try {
        // 2. Disputa (race) entre a simulação real e o cronômetro
        return await Promise.race([banco.simular(dados), timeout]);
      } finally {
        // CORREÇÃO 5: Cancela o temporizador obrigatoriamente, independente de sucesso ou falha
        clearTimeout(timerId);
      }
    });

    const resultadosSettled = await Promise.allSettled(promessas);

    // 3. Formata os resultados finais
    return resultadosSettled.map((resultado, index) => {
      if (resultado.status === "fulfilled") {
        return resultado.value;
      } else {
        const bancoQueFalhou = this.bancos[index];
        return {
          banco: bancoQueFalhou?.nome || "Banco Desconhecido",
          status: "Indisponivel",
          motivo: resultado.reason instanceof Error ? resultado.reason.message : "Falha desconhecida no banco."
        };
      }
    });
  }
}