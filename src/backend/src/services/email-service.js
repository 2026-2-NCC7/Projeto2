function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createPasswordResetEmail({ name, resetUrl }) {
  const safeName = escapeHtml(name || "cliente");
  const safeUrl = escapeHtml(resetUrl);

  return {
    subject: "Redefina sua senha do Ach.ai",
    text: [
      `Olá, ${name || "cliente"}!`,
      "",
      "Recebemos uma solicitação para redefinir sua senha do Ach.ai.",
      `Acesse o link para criar uma nova senha: ${resetUrl}`,
      "",
      "Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este e-mail.",
    ].join("\n"),
    html: `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      </style>
      <div style="margin:0;background:#f7f9f7;padding:32px 16px;font-family:'Inter',Arial,sans-serif;color:#17211b">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;font-family:'Inter',Arial,sans-serif">
          <div style="background:#f97300;padding:28px 32px">
            <div style="font-family:'Inter',Arial,sans-serif;font-size:28px;font-weight:700;letter-spacing:-1px">Ach.ai</div>
            <div style="margin-top:8px;font-family:'Inter',Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px">SUA COMPRA, MAIS INTELIGENTE</div>
          </div>
          <div style="padding:32px">
            <h1 style="margin:0 0 16px;font-family:'Inter',Arial,sans-serif;font-size:24px;line-height:1.2">Redefina sua senha</h1>
            <p style="margin:0 0 12px;font-family:'Inter',Arial,sans-serif;font-size:16px;line-height:1.5">Olá, ${safeName}!</p>
            <p style="margin:0 0 24px;font-family:'Inter',Arial,sans-serif;color:#68736d;font-size:15px;line-height:1.6">
              Recebemos uma solicitação para redefinir sua senha do Ach.ai. Clique no botão abaixo para criar uma nova senha.
            </p>
            <a href="${safeUrl}" style="display:inline-block;border-radius:10px;background:#17211b;padding:14px 22px;color:#ffffff;font-family:'Inter',Arial,sans-serif;font-weight:700;text-decoration:none">
              Redefinir minha senha
            </a>
            <p style="margin:24px 0 0;font-family:'Inter',Arial,sans-serif;color:#68736d;font-size:13px;line-height:1.5">
              Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este e-mail.
            </p>
          </div>
        </div>
      </div>
    `,
  };
}

function createPasswordResetSender({ apiKey, fromEmail, fetchImpl = fetch, log = console.log } = {}) {
  return async function sendPasswordResetEmail({ admin, resetUrl }) {
    if (!apiKey) {
      log(`Link de redefinição de senha para ${admin.email}: ${resetUrl}`);
      return;
    }
    if (!fromEmail) {
      throw new Error("RESEND_FROM_EMAIL não está configurado.");
    }

    const email = createPasswordResetEmail({
      name: admin.display_name,
      resetUrl,
    });
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [admin.email],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Resend recusou o envio (${response.status}): ${details}`);
    }
  };
}

module.exports = { createPasswordResetEmail, createPasswordResetSender, escapeHtml };
