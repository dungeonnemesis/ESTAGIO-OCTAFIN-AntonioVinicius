## Regras de Negócio e Simuladores

Para o cálculo de simulação de empréstimo consignado, foram definidos dois perfis de instituições financeiras:

1. **Banco Caixote (Paródia Caixa)**
   - Margem consignável máxima: 30% do salário.
   - Taxa de juros: 1,45% a.m.
   - Prazo máximo: 48 meses.

2. **Banco BMJ (Paródia BMG)**
   - Margem consignável máxima: 35% do salário.
   - Taxa de juros: 2,10% a.m.
   - Prazo máximo: 72 meses.

### Formato Único de Saída (API Adapter)
Ambas as respostas são convertidas para o seguinte formato padronizado na API backend:

```json
[
  {
    "banco": "Banco Caixote",
    "status": "APROVADO",
    "taxaJurosMensal": 0.0145,
    "valorParcela": 322.50,
    "valorTotal": 6450.00
  }
]