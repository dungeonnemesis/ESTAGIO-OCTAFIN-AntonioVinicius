import { z } from "zod";

// Função auxiliar para validar o dígito verificador do CPF
function validaCPF(cpf: string) {
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

// Função auxiliar para validar o dígito verificador do CNPJ
function validaCNPJ(cnpj: string) {
  if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  return true;
}

export const simulacaoSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Email inválido"),
  
  cpf: z.string()
    .transform(val => val.replace(/[^\d]/g, ""))
    .refine(val => validaCPF(val), "CPF inválido"),
    
  cnpj: z.string()
    .transform(val => val.replace(/[^\d]/g, ""))
    .refine(val => validaCNPJ(val), "CNPJ inválido"),

  valorEmprestimo: z.coerce.number()
    .positive("O valor do empréstimo deve ser maior que zero"),
  
  salario: z.coerce.number()
    .positive("O salário deve ser maior que zero"),
  
  parcelas: z.coerce.number()
    .int("O número de parcelas deve ser inteiro")
    .min(1, "O número mínimo de parcelas é 1")
    .max(72, "O número máximo de parcelas permitido é 72"),
});