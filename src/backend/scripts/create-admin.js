const { Pool } = require("pg");
const { createAdmin, isValidEmail } = require("../src/services/auth-service");

function readHiddenInput(prompt) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    return Promise.reject(new Error("Run this command in an interactive terminal."));
  }

  process.stdout.write(prompt);
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    let value = "";

    function finish(error) {
      input.removeListener("data", onData);
      input.setRawMode(false);
      input.pause();
      process.stdout.write("\n");
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    }

    function onData(chunk) {
      for (const character of chunk.toString("utf8")) {
        if (character === "\u0003") {
          finish(new Error("Password input cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
        } else {
          value += character;
        }
      }
    }

    input.setRawMode(true);
    input.resume();
    input.on("data", onData);
  });
}

async function main() {
  const email = process.argv[2];
  if (!isValidEmail(email)) {
    throw new Error("Usage: npm run create-admin -- <email>");
  }

  const password = await readHiddenInput("Administrator password (12+ characters): ");
  const confirmation = await readHiddenInput("Confirm password: ");
  if (password !== confirmation) {
    throw new Error("Passwords do not match.");
  }

  const pool = new Pool();
  try {
    const admin = await createAdmin(pool, email, password);
    if (!admin) {
      throw new Error("An administrator with this email already exists.");
    }
    console.log(`Administrator created: ${admin.email}`);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { readHiddenInput };
