export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const apenasNumeros = (v: string) => v.replace(/\D/g, "");

const aplicarMascara = (valor: string, padrao: string) => {
  const digitos = apenasNumeros(valor);
  let i = 0;
  let saida = "";
  for (const ch of padrao) {
    if (i >= digitos.length) break;
    saida += ch === "#" ? digitos[i++] : ch;
  }
  return saida;
};

export const maskCPF = (v: string) => aplicarMascara(v, "###.###.###-##");
export const maskCNPJ = (v: string) => aplicarMascara(v, "##.###.###/####-##");