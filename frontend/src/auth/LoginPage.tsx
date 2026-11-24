import { useState, type FormEvent } from 'react';
import { mensagemDoErro } from '../api/mensagens';
import { AlternarTema } from '../componentes/AlternarTema';
import { Icone } from '../componentes/Icone';
import { Marca } from '../componentes/Marca';
import { useAuth } from './contexto';

type Modo = 'entrar' | 'cadastrar';

export function LoginPage() {
  const { entrar, cadastrar } = useAuth();

  const [modo, setModo] = useState<Modo>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      if (modo === 'entrar') {
        await entrar({ email, senha });
      } else {
        await cadastrar(nome, { email, senha });
      }
    } catch (causa) {
      setErro(mensagemDoErro(causa));
    } finally {
      setEnviando(false);
    }
  }

  function alternarModo() {
    setModo((atual) => (atual === 'entrar' ? 'cadastrar' : 'entrar'));
    setErro(null);
  }

  return (
    <main className="login">
      <section className="login__vitrine" aria-hidden="true">
        <Marca />
        <div className="login__chamada">
          <h2>
            Do pedido à porta, <em>sem perder nenhum</em> de vista.
          </h2>
          <p>Acompanhe cada pedido pelo quadro: recebido, em preparo, a caminho e entregue.</p>
        </div>

        <div className="login__comandas">
          <div className="comanda-demo comanda-demo--tras" data-status="saiu_para_entrega">
            <div className="comanda-demo__linha">
              <span className="comanda-demo__id">#0141</span>
              <span className="comanda-demo__status">
                <Icone nome="moto" tamanho={13} />
                Saiu para entrega
              </span>
            </div>
            <strong>Marcos Lima</strong>
            <small>Rua Harmonia, 412 — Vila Madalena</small>
          </div>
          <div className="comanda-demo" data-status="em_preparo">
            <div className="comanda-demo__linha">
              <span className="comanda-demo__id">#0142</span>
              <span className="comanda-demo__status">
                <Icone nome="chama" tamanho={13} />
                Em preparo · 6 min
              </span>
            </div>
            <strong>Ana Ribeiro</strong>
            <small>2× Pizza margherita · 1× Guaraná 2 L</small>
            <div className="comanda-demo__total">
              <span>Total</span>
              <b>R$ 104,70</b>
            </div>
          </div>
        </div>

        <ol className="login__etapas">
          <li data-status="recebido"><Icone nome="comanda" tamanho={16} />Recebido</li>
          <li data-status="em_preparo"><Icone nome="chama" tamanho={16} />Em preparo</li>
          <li data-status="saiu_para_entrega"><Icone nome="moto" tamanho={16} />Saiu para entrega</li>
          <li data-status="entregue"><Icone nome="feito" tamanho={16} />Entregue</li>
        </ol>
      </section>

      <section className="login__painel">
        <AlternarTema className="login__tema" />
        <form className="cartao login__form" onSubmit={enviar} noValidate>
          <div className="login__marca-celular">
            <Marca />
          </div>

          <div>
            <h1>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</h1>
            <p className="apoio">
              {modo === 'entrar' ? 'Entre para acompanhar os pedidos.' : 'Crie sua conta para começar.'}
            </p>
          </div>

          {modo === 'cadastrar' && (
            <div className="campo">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="voce@loja.com"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
              required
            />
            {modo === 'cadastrar' && <small className="apoio">Mínimo de 8 caracteres.</small>}
          </div>

          {erro && (
            <div className="banner-erro" role="alert">
              <Icone nome="alerta" tamanho={18} />
              <p>{erro}</p>
            </div>
          )}

          <button type="submit" className="botao botao--bloco botao--grande" disabled={enviando}>
            {enviando ? 'Enviando…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>

          <p className="login__alternar">
            {modo === 'entrar' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
            <button type="button" className="botao-link" onClick={alternarModo}>
              {modo === 'entrar' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
