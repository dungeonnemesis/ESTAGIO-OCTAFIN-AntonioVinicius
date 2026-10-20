import type { EntradaSimulacao, SaidaSimulacao } from "../types/simulation.js";

export interface SimuladorBanco {
  simular(dados: EntradaSimulacao): Promise<SaidaSimulacao>;
}