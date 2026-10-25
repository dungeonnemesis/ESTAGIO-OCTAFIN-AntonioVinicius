export interface EntradaSimulacao {
    nome: string;
    cpf: string;
    cnpj: string;
    salario: number;
    valorEmprestimo: number;
    parcelas: number;
    email: string; 
}

export interface SaidaSimulacao {
    banco: string;
    status: "Aprovado" | "Reprovado" | "Indisponivel";
    taxaJurosMensal?: number;
    valorParcela?: number;
    valorTotal?: number;
    motivo?: string;
}