const assert = require("node:assert/strict");
const test = require("node:test");
const { createPasswordResetEmail, createPasswordResetSender } = require("../src/services/email-service");

test("creates a branded password reset email and escapes dynamic values", () => {
  const email = createPasswordResetEmail({
    name: "<Ana>",
    resetUrl: "https://app.example/reset?token=abc&x=1",
  });

  assert.equal(email.subject, "Redefina sua senha do Ach.ai");
  assert.match(email.html, /&lt;Ana&gt;/);
  assert.match(email.html, /token=abc&amp;x=1/);
  assert.match(email.text, /https:\/\/app\.example\/reset\?token=abc&x=1/);
});

test("sends password reset email through Resend", async () => {
  let request;
  const sender = createPasswordResetSender({
    apiKey: "re_test",
    fromEmail: "Ach.ai <no-reply@example.com>",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, status: 200, text: async () => "" };
    },
  });

  await sender({
    admin: { email: "ana@example.com", display_name: "Ana" },
    resetUrl: "https://app.example/reset?token=abc",
  });

  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.options.headers.Authorization, "Bearer re_test");
  const body = JSON.parse(request.options.body);
  assert.equal(body.from, "Ach.ai <no-reply@example.com>");
  assert.deepEqual(body.to, ["ana@example.com"]);
  assert.equal(body.subject, "Redefina sua senha do Ach.ai");
  assert.match(body.html, /Redefina sua senha/);
  assert.match(body.text, /https:\/\/app\.example\/reset\?token=abc/);
});
