import { simulacaoSchema } from "../validators/simulation.validator.js";
import { BancoCaixote } from "../simulators/caixote.simulator.js";
import { BancoBMJ } from "../simulators/bmj.simulator.js";
import type { SaidaSimulacao } from "../types/simulation.js";

export class SimulacaoService {
  async processarSimulacoes(dadosBrutos: unknown): Promise<SaidaSimulacao[]> {
    // 1. Validação: O Zod verifica se os dados enviados estão corretos (O Segurança)
    const dadosValidados = simulacaoSchema.parse(dadosBrutos);

    // 2. Instanciação: Criamos os objetos reais dos bancos a partir das classes (Os Especialistas)
    const bancoCaixote = new BancoCaixote();
    const bancoBmj = new BancoBMJ();

    // 3. Orquestração: Colocamos os bancos para calcular ao mesmo tempo (O Gerente)
    const resultados = await Promise.all([
      bancoCaixote.simular(dadosValidados),
      bancoBmj.simular(dadosValidados)
    ]);

    // 4. Retorna a lista com as respostas de todos os bancos
    return resultados;
  }
}