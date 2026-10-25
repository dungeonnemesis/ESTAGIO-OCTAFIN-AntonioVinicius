import type { EntradaSimulacao, SaidaSimulacao } from "../types/simulation.js";

export interface SimuladorBanco {
  readonly nome: string;
  simular(entrada: EntradaSimulacao): Promise<SaidaSimulacao>;
}