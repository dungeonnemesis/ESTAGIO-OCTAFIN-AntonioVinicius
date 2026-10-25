export interface EntradaSimulacao {
  nome: string;
  email: string;
  cpf: string;
  cnpj: string;
  salario: number;
  valorEmprestimo: number;
  parcelas: number;
}

export type StatusBanco = "Aprovado" | "Reprovado" | "Indisponivel";

export interface SaidaSimulacao {
  banco: string;
  status: StatusBanco;
  taxaJurosMensal?: number;
  valorParcela?: number;
  valorTotal?: number;
  motivo?: string;
}