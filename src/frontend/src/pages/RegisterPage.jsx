import { useState } from "react";
import Brand from "../components/Brand.jsx";
import { registerAdmin } from "../services/auth-api.js";

export default function RegisterPage({ onLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmation: "" });
  const [feedback, setFeedback] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmation) {
      setFeedback("Preencha todos os campos para continuar.");
      return;
    }
    if (form.password !== form.confirmation) {
      setFeedback("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      const { response, body } = await registerAdmin(form.name, form.email.trim(), form.password, form.confirmation);
      if (!response.ok) {
        setFeedback(body.error || "Não foi possível criar o administrador.");
        return;
      }
      setSuccess(true);
    } catch {
      setFeedback("Não foi possível conectar à API. Verifique se o ambiente está ativo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return <div className="success-page"><span className="success-icon">✓</span><h2>Administrador criado</h2><p>O cadastro foi concluído. Você já pode acessar o dashboard.</p><button className="submit-button" type="button" onClick={onLogin}>Voltar para o login</button></div>;
  }

  return (
    <>
      <div className="form-heading">
        <p className="eyebrow">Novo acesso</p>
        <h2>Crie seu administrador</h2>
        <p>Cadastre uma conta para gerenciar o dashboard da sua loja.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="register-name">Nome completo</label>
        <div className="input-wrap"><input id="register-name" type="text" autoComplete="name" placeholder="Como devemos chamar você?" value={form.name} onChange={update("name")} /></div>
        <label htmlFor="register-email" className="form-label-spaced">E-mail corporativo</label>
        <div className="input-wrap"><input id="register-email" type="email" autoComplete="email" placeholder="nome@empresa.com" value={form.email} onChange={update("email")} /></div>
        <label htmlFor="register-password" className="form-label-spaced">Senha</label>
        <div className="input-wrap"><input id="register-password" type="password" autoComplete="new-password" placeholder="Mínimo de 12 caracteres" value={form.password} onChange={update("password")} /></div>
        <label htmlFor="register-confirmation" className="form-label-spaced">Confirme sua senha</label>
        <div className="input-wrap"><input id="register-confirmation" type="password" autoComplete="new-password" placeholder="Repita sua senha" value={form.confirmation} onChange={update("confirmation")} /></div>
        {feedback && <p className="feedback" role="alert">{feedback}</p>}
        <button className="submit-button" type="submit" disabled={loading}>{loading ? "Criando acesso..." : "Criar administrador"}</button>
      </form>
      <button type="button" className="back-button" onClick={onLogin}>Já tenho uma conta</button>
    </>
  );
}
