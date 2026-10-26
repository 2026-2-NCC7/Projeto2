import { useState } from "react";
import storeIcon from "../assets/icons/store.svg";
import circleHelpIcon from "../assets/icons/circle-help.svg";
import eyeOffIcon from "../assets/icons/eye-off.svg";
import setaAvancoIcon from "../assets/icons/seta-avanco.svg";
import detalheGraficoIcon from "../assets/icons/detalhe-grafico.svg";
import destaqueCrescimentoIcon from "../assets/icons/destaque-crescimento.svg";
import arrowUpRightIcon from "../assets/icons/arrow-up-right.svg";

export default function LoginSupermercado({ onCadastro, onEsqueciSenha }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [status, setStatus] = useState("idle");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    // TODO: Implementar lógica de login do supermercado
    console.log("Login supermercado:", { email, senha });
  }

  return (
    <div className="login-supermercado">
      <aside className="apresentacao-portal">
        <div className="marca-portal">
          <div className="brand-lockup">
            <div className="brand-mark">A</div>
            <div className="brand-name">Ach.ai</div>
          </div>
          <span className="selo-parceiros">PARCEIROS</span>
        </div>

        <div className="proposta-parceiro">
          <div className="selo-portal">
            <img src={storeIcon} alt="" aria-hidden="true" />
            <span>Portal do supermercado</span>
          </div>

          <h1 className="titulo-proposta">
            Sua loja vende.
            <br />
            Você acompanha.
          </h1>

          <p className="descricao-proposta">
            Veja como o Ach.ai ajuda os clientes a encontrar sua loja e acompanhe as vendas
            geradas por essa conexão.
          </p>

          <div className="ilustracao-supermercado">
            <div className="base-supermercado" />
            <div className="fachada-supermercado" />
            <div className="letreiro-supermercado" />
            <div className="porta-supermercado" />
            <div className="puxador-porta" />
            <div className="vitrine-supermercado" />
            
            {/* Toldos */}
            <div className="toldo toldo-1" />
            <div className="toldo toldo-2" />
            <div className="toldo toldo-3" />
            <div className="toldo toldo-4" />
            <div className="toldo toldo-5" />
            <div className="toldo toldo-6" />
            <div className="toldo toldo-7" />
            <div className="toldo toldo-8" />

            <div className="logo-letreiro">Ach.ai</div>
            <img src={detalheGraficoIcon} alt="" className="detalhe-grafico" aria-hidden="true" />
            <img src={destaqueCrescimentoIcon} alt="" className="destaque-crescimento" aria-hidden="true" />
            <img src={arrowUpRightIcon} alt="" className="icone-crescimento" aria-hidden="true" />
          </div>
        </div>

        <p className="rodape-marca">
          Mais perto de quem compra. Mais valor para sua loja.
        </p>
      </aside>

      <section className="area-acesso">
        <header className="cabecalho-acesso">
          <p className="label-acesso">ACESSO PARA SUPERMERCADOS</p>
          <button type="button" className="link-ajuda">
            <img src={circleHelpIcon} alt="" aria-hidden="true" />
            <span>Precisa de ajuda?</span>
          </button>
        </header>

        <div className="conteudo-formulario">
          <div className="boas-vindas">
            <h2>Bom ter sua loja aqui.</h2>
            <p>
              Entre no portal do parceiro para acompanhar os resultados do seu supermercado.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="formulario-supermercado">
            <div className="campo-formulario">
              <label htmlFor="email-profissional">E-mail profissional</label>
              <div className="entrada-campo">
                <input
                  id="email-profissional"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@supermercado.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="campo-formulario">
              <label htmlFor="senha-supermercado">Senha</label>
              <div className="entrada-campo entrada-senha">
                <input
                  id="senha-supermercado"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  className="botao-toggle-senha"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  <img src={eyeOffIcon} alt="" aria-hidden="true" />
                </button>
              </div>
            </div>

            <button
              type="button"
              className="link-esqueci-senha"
              onClick={onEsqueciSenha}
            >
              Esqueci minha senha
            </button>

            <button type="submit" className="botao-entrar" disabled={status === "loading"}>
              <span>Entrar no portal</span>
              <img src={setaAvancoIcon} alt="" aria-hidden="true" />
            </button>

            <div className="acesso-cadastro">
              <span>Ainda não é parceiro?</span>
              <button type="button" className="link-cadastro" onClick={onCadastro}>
                Cadastre seu supermercado
              </button>
              <img src={setaAvancoIcon} alt="" aria-hidden="true" />
            </div>
          </form>
        </div>

        <footer className="rodape-acesso">
          <p>© 2026 Ach.ai</p>
          <p>Privacidade e termos de uso</p>
        </footer>
      </section>
    </div>
  );
}
