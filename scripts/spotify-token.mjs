#!/usr/bin/env node
/**
 * One-time helper to obtain a Spotify refresh token.
 *
 * Spotify's recently-played endpoint needs a *user* access token, which the
 * client-credentials flow cannot produce. The authorisation-code flow requires
 * a browser redirect, so this runs a throwaway local server, opens the consent
 * screen, catches the redirect, and exchanges the code for a refresh token.
 *
 * Run once:  npm run spotify:token
 *
 * The resulting refresh token is long-lived. Put it in .env.local and this
 * script is never needed again.
 *
 * Deliberately dependency-free — it uses only node: builtins, so it does not
 * add anything to the application's dependency tree for a one-off task.
 */

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;

// Read-only, and the narrowest scope that satisfies the feature. Anything
// broader would be asking for privilege the site never exercises.
const SCOPE = "user-read-recently-played";

const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();

if (!clientId || !clientSecret) {
  console.error(
    "\nSPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set before running this.\n\n" +
      "  1. Create an app at https://developer.spotify.com/dashboard\n" +
      `  2. Add this exact redirect URI to it: ${REDIRECT_URI}\n` +
      "  3. Put the client ID and secret in .env.local\n" +
      "  4. Re-run: npm run spotify:token\n",
  );
  process.exit(1);
}

// Guards against a forged callback hitting the local server.
const state = randomBytes(16).toString("hex");

const authorizeUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state,
    // Forces the consent screen even if the app was authorised before, so a
    // re-run reliably produces a fresh token.
    show_dialog: "true",
  }).toString();

function html(title, body) {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="font:16px system-ui;padding:3rem;max-width:40rem;margin:auto">
<h1 style="font-size:1.25rem">${title}</h1><p>${body}</p></body>`;
}

async function exchangeCode(code) {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(
      `Token exchange failed (${response.status}): ${await response.text()}`,
    );
  }

  return response.json();
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname !== "/callback") {
    response.writeHead(404).end();
    return;
  }

  const error = url.searchParams.get("error");
  if (error) {
    response
      .writeHead(400, { "Content-Type": "text/html" })
      .end(html("Authorisation denied", `Spotify returned: ${error}`));
    server.close();
    process.exit(1);
  }

  if (url.searchParams.get("state") !== state) {
    response
      .writeHead(400, { "Content-Type": "text/html" })
      .end(
        html(
          "State mismatch",
          "The callback did not match this session. Re-run the script.",
        ),
      );
    server.close();
    process.exit(1);
  }

  const code = url.searchParams.get("code");
  if (!code) {
    response.writeHead(400).end();
    server.close();
    process.exit(1);
  }

  try {
    const tokens = await exchangeCode(code);

    response
      .writeHead(200, { "Content-Type": "text/html" })
      .end(
        html(
          "Done",
          "Refresh token printed in your terminal. You can close this tab.",
        ),
      );

    console.log("\n  Add this to .env.local:\n");
    console.log(`  SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    console.log(
      "  Keep it secret. It grants read access to your listening history.\n",
    );

    server.close();
    process.exit(0);
  } catch (cause) {
    response
      .writeHead(500, { "Content-Type": "text/html" })
      .end(html("Exchange failed", "See the terminal for details."));
    console.error(cause);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n  Listening on ${REDIRECT_URI}`);
  console.log("\n  Open this URL in a browser to authorise:\n");
  console.log(`  ${authorizeUrl}\n`);
});
