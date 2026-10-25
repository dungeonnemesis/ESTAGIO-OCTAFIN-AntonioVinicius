// (demora entre 0.5s e 2s pra api responder)
export function atrasoAleatorio(minMs = 500, maxMs = 2000): Promise<void> {
  const atraso = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, atraso));
}