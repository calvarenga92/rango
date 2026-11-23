import type { CorpoErro } from './tipos';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export class ErroApi extends Error {
  readonly codigo: string;
  readonly status: number;
  readonly detalhes: string[];

  constructor(status: number, corpo: Partial<CorpoErro>) {
    super(corpo.mensagem ?? 'Não foi possível completar a operação');
    this.name = 'ErroApi';
    this.status = status;
    this.codigo = corpo.codigo ?? 'ERRO_DESCONHECIDO';
    this.detalhes = corpo.detalhes ?? [];
  }
}

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  corpo?: unknown;
  token?: string | null;
}

// A API roda no plano gratuito do Render, que desliga depois de ~15 min sem
// uso e leva até 1 min para ligar. Se a última resposta foi há mais de 10 min
// e a chamada demora, a interface avisa que o servidor está ligando.
const PARADA_MS = 10 * 60_000;
const DEMORA_MS = 2_500;
let ultimaResposta = 0;
let ligando = false;
const ouvintes = new Set<(ligando: boolean) => void>();

function marcarLigando(valor: boolean) {
  if (ligando === valor) return;
  ligando = valor;
  ouvintes.forEach((ouvinte) => ouvinte(valor));
}

export const servidor = {
  /** Avisa `true` enquanto a API está ligando e `false` quando ela responde. */
  ouvir(ouvinte: (ligando: boolean) => void) {
    ouvintes.add(ouvinte);
    ouvinte(ligando);
    return () => {
      ouvintes.delete(ouvinte);
    };
  },
  /** Acorda a API antes de alguém precisar dela. */
  acordar() {
    requisitar('/api/saude').catch(() => {});
  },
};

export async function requisitar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const inicio = Date.now();
  const temporizador =
    inicio - ultimaResposta > PARADA_MS
      ? window.setTimeout(() => {
          // Só avisa se o servidor não respondeu nada desde que esta chamada saiu.
          if (ultimaResposta < inicio) marcarLigando(true);
        }, DEMORA_MS)
      : undefined;
  try {
    return await chamar<T>(caminho, opcoes);
  } finally {
    window.clearTimeout(temporizador);
  }
}

async function chamar<T>(caminho: string, opcoes: Opcoes): Promise<T> {
  const { metodo = 'GET', corpo, token } = opcoes;

  let resposta: Response;

  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      method: metodo,
      headers: {
        ...(corpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    marcarLigando(false);
    throw new ErroApi(0, {
      codigo: 'SEM_CONEXAO',
      mensagem: 'Não foi possível falar com o servidor.',
    });
  }

  // Qualquer resposta, até de erro, quer dizer que o servidor está de pé.
  ultimaResposta = Date.now();
  marcarLigando(false);

  const texto = await resposta.text();
  const dados = texto ? (JSON.parse(texto) as unknown) : null;

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, (dados ?? {}) as Partial<CorpoErro>);
  }

  return dados as T;
}
