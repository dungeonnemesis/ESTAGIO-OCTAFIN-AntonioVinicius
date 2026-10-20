import { z } from "zod";

// Define o Schema de validação para a entrada da simulação
export const simulacaoSchema = z.object({
    nome: z.string().min(3, "O nome é obrigatório"),
    cpf: z.string().regex(/^\d{11}$/, "O CPF deve conter 11 dígitos"),
    cnpj: z.string().regex(/^\d{14}$/, "O CNPJ deve conter 14 dígitos"),
    salario: z.number().min(0, "O salário deve ser um valor positivo"),
    valorEmprestimo: z.number().min(0, "O valor do empréstimo deve ser um valor positivo"),
    parcelas: z.number().min(1, "Mínimo de 1 parcela").max(72, "Máximo de 72 parcelas"),
});