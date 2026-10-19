import { useState } from "react";
import Brand from "../components/Brand.jsx";
import { loginAdmin } from "../services/auth-api.js";

export default function LoginPage({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("idle");

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
      setFeedback("Informe um e-mail válido e sua senha.");
      return;
    }
    setStatus("loading");
    try {
      const { response, body } = await loginAdmin(email.trim(), password);
      if (!response.ok) {
        setFeedback(response.status === 401
          ? "E-mail ou senha inválidos. Confira seus dados e tente novamente."
          : body.error || "Não foi possível concluir o login.");
        setStatus("idle");
        return;
      }
      sessionStorage.setItem("achai_admin_token", body.token);
      setPassword("");
      setStatus("success");
    } catch {
      setFeedback("Não foi possível conectar à API. Verifique se o ambiente está ativo.");
      setStatus("idle");
    }
  }

  return (
    <>
      <div className="form-heading">
        <p className="eyebrow">Acesso restrito</p>
        <h2>Bem-vindo de volta</h2>
        <p>Entre com suas credenciais de administrador para acessar o dashboard.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="login-email">E-mail corporativo</label>
        <div className="input-wrap">
          <span className="input-icon" aria-hidden="true">@</span>
          <input id="login-email" type="email" autoComplete="email" placeholder="nome@empresa.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="label-row">
          <label htmlFor="login-password">Senha</label>
          <button type="button" className="text-button" onClick={onRegister}>Criar administrador</button>
        </div>
        <div className="input-wrap">
          <span className="input-icon" aria-hidden="true">•</span>
          <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="password-toggle" type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Ocultar" : "Mostrar"}</button>
        </div>
        {feedback && <p className="feedback" role="alert">{feedback}</p>}
        <button className="submit-button" type="submit" disabled={status === "loading"}>
          <span>{status === "loading" ? "Validando acesso..." : "Entrar no dashboard"}</span>
          {status === "loading" && <span className="spinner" aria-hidden="true" />}
        </button>
      </form>
      {status === "success" && <div className="success-panel" role="status"><span className="success-icon">✓</span><div><strong>Login validado</strong><p>Seu token foi recebido. O dashboard está pronto para ser conectado.</p></div></div>}
    </>
  );
}
