import type { SimuladorBanco } from "../simulators/simulator.interface.js";
import type { EntradaSimulacao, SaidaSimulacao } from "../types/simulation.js";

export class SimulacaoService {
  private bancos: SimuladorBanco[];

  // O serviço agora recebe a lista de bancos pronta (Injeção de Dependência)
  constructor(bancos: SimuladorBanco[]) {
    this.bancos = bancos;
  }

  // Já não recebe 'unknown', recebe os dados tipados e validados pela Rota
  async processarSimulacoes(dados: EntradaSimulacao): Promise<SaidaSimulacao[]> {
    
    // 1. Prepara a simulação de cada banco com um limite de tempo de 3 segundos
    const promessas = this.bancos.map(async (banco) => {
      // Cria uma promessa que "explode" (rejeita) após 3 segundos
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout: O banco demorou mais de 3 segundos para responder.")), 3000)
      );

      // Disputa (race) entre a simulação real do banco e o cronômetro do timeout
      return Promise.race([banco.simular(dados), timeout]);
    });

    // 2. Aguarda que todos os bancos terminem (seja com sucesso ou com erro)
    const resultadosSettled = await Promise.allSettled(promessas);

    // 3. Formata os resultados finais
    return resultadosSettled.map((resultado, index) => {
      if (resultado.status === "fulfilled") {
        return resultado.value; // Se deu certo, devolve a proposta do banco
      } else {
        // Se falhou (erro interno do banco ou timeout), devolvemos "Indisponivel"
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