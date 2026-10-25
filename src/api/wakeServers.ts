const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = "preparo:wokeAt";
//10 minutes in milliseconds
const SKIP_FOR_MS = 10 * 60 * 1000;

let lastPingAt = 0;

function pingedRecently() {
  let at = lastPingAt;
  try {
    at = Math.max(at, Number(sessionStorage.getItem(STORAGE_KEY)) || 0);
  } catch {
    // Storage blocked: fall back to the in-memory time
  }
  return Date.now() - at < SKIP_FOR_MS;
}

function rememberPing() {
  lastPingAt = Date.now();
  try {
    sessionStorage.setItem(STORAGE_KEY, String(lastPingAt));
  } catch {
    // Storage blocked: the in-memory time still stops repeats on this page
  }
}

function ping(url: string) {
  fetch(url, { mode: "no-cors", keepalive: true, cache: "no-store" }).catch(
    () => {
      // Expected while the server is still asleep; the real requests wait for it
    },
  );
}

export function wakeServers() {
  if (pingedRecently()) return;
  rememberPing();

  ping(`${API_URL}/actuator/health`);
  // ping(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid-configuration`);
}
