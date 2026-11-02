/**
 * Evolution GO WhatsApp Gateway Service
 * Integrates OPUS Finance with the local or Cloudflare-tunneled Evolution GO (whatsmeow) instance.
 */

const STORAGE_KEY = "opus_whatsapp_config";

export const DEFAULT_CONFIG = {
  serverUrl: "https://okay-trunk-donation-loans.trycloudflare.com",
  fallbackUrl: "http://localhost:4000",
  globalApiKey: "429683C4C977415CAAFCCE10F7D57E11",
  instanceName: "opus_finance",
  instanceToken: "opus_token_secret",
  managerUrl: "https://okay-trunk-donation-loans.trycloudflare.com/manager/login",
  swaggerUrl: "https://okay-trunk-donation-loans.trycloudflare.com/swagger/index.html",
  useLocal: false,
};

export function getWhatsAppConfig() {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveWhatsAppConfig(updates) {
  if (typeof window === "undefined") return;
  const current = getWhatsAppConfig();
  const next = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("opus_whatsapp_config_changed", { detail: next }));
  return next;
}

export function getActiveServerUrl() {
  const cfg = getWhatsAppConfig();
  return cfg.useLocal ? cfg.fallbackUrl : cfg.serverUrl;
}

/**
 * Health check: verify gateway is online
 */
export async function checkGatewayHealth() {
  const cfg = getWhatsAppConfig();
  const urls = cfg.useLocal 
    ? [cfg.fallbackUrl, cfg.serverUrl] 
    : [cfg.serverUrl, cfg.fallbackUrl];

  for (const url of urls) {
    try {
      const res = await fetch(`${url}/server/ok`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        return { ok: true, url, data };
      }
    } catch {
      // try next
    }
  }
  return { ok: false, error: "Gateway unreachable" };
}

/**
 * Ensure the instance exists on the server
 */
export async function ensureInstance() {
  const cfg = getWhatsAppConfig();
  const base = getActiveServerUrl();

  try {
    // 1. List all instances
    const res = await fetch(`${base}/instance/all`, {
      method: "GET",
      headers: {
        "apikey": cfg.globalApiKey,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const json = await res.json();
      const list = json.data || [];
      const existing = list.find((i) => i.name === cfg.instanceName);
      if (existing) {
        return { ok: true, instance: existing };
      }
    }

    // 2. Create if not found
    const createRes = await fetch(`${base}/instance/create`, {
      method: "POST",
      headers: {
        "apikey": cfg.globalApiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: cfg.instanceName,
        token: cfg.instanceToken,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const createJson = await createRes.json();
    return { ok: createRes.ok, instance: createJson.data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get instance connection status
 */
export async function getInstanceStatus() {
  const cfg = getWhatsAppConfig();
  const base = getActiveServerUrl();

  try {
    const res = await fetch(`${base}/instance/status`, {
      method: "GET",
      headers: {
        "apikey": cfg.instanceToken,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const json = await res.json();
      const statusData = json.data || {};
      return {
        ok: true,
        connected: Boolean(statusData.Connected),
        loggedIn: Boolean(statusData.LoggedIn),
        name: statusData.Name || "",
      };
    }

    // If 401/not authorized, try to ensure instance exists
    await ensureInstance();
    return { ok: false, connected: false, loggedIn: false };
  } catch (err) {
    return { ok: false, error: err.message, connected: false, loggedIn: false };
  }
}

/**
 * Connect instance and get base64 QR Code
 */
export async function connectAndGetQRCode() {
  const cfg = getWhatsAppConfig();
  const base = getActiveServerUrl();

  try {
    // 1. Ensure instance exists
    await ensureInstance();

    // 2. Call connect
    await fetch(`${base}/instance/connect`, {
      method: "POST",
      headers: {
        "apikey": cfg.instanceToken,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(8000),
    });

    // 3. Fetch QR Code
    const qrRes = await fetch(`${base}/instance/qr`, {
      method: "GET",
      headers: {
        "apikey": cfg.instanceToken,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (qrRes.ok) {
      const json = await qrRes.json();
      const qrData = json.data || {};
      return {
        ok: true,
        qrcode: qrData.qrcode || "", // base64 data URI
        code: qrData.code || "",
      };
    }

    return { ok: false, error: "Failed to generate QR code" };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Request Phone Pairing Code (alternate to QR)
 */
export async function requestPairingCode(phone) {
  const cfg = getWhatsAppConfig();
  const base = getActiveServerUrl();
  const cleanPhone = phone.replace(/\D/g, "");

  try {
    await ensureInstance();

    const res = await fetch(`${base}/instance/pair`, {
      method: "POST",
      headers: {
        "apikey": cfg.instanceToken,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        phone: cleanPhone,
        subscribe: ["MESSAGE"],
      }),
      signal: AbortSignal.timeout(8000),
    });

    const json = await res.json();
    return {
      ok: res.ok,
      pairingCode: json.data?.PairingCode || json.data?.pairingCode || "",
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Disconnect or Logout from WhatsApp
 */
export async function disconnectWhatsApp() {
  const cfg = getWhatsAppConfig();
  const base = getActiveServerUrl();

  try {
    const res = await fetch(`${base}/instance/logout`, {
      method: "DELETE",
      headers: {
        "apikey": cfg.instanceToken,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });
    return { ok: res.ok };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Send a WhatsApp Text Message
 */
export async function sendWhatsAppMessage({ number, text }) {
  const cfg = getWhatsAppConfig();
  const base = getActiveServerUrl();
  const cleanNumber = (number || "").replace(/\D/g, "");

  if (!cleanNumber) {
    throw new Error("Please provide a valid phone number with country code (e.g. 971501234567 or 5511999999999).");
  }
  if (!text) {
    throw new Error("Message text cannot be empty.");
  }

  const res = await fetch(`${base}/send/text`, {
    method: "POST",
    headers: {
      "apikey": cfg.instanceToken,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      number: cleanNumber,
      text: text,
      delay: 1,
    }),
    signal: AbortSignal.timeout(10000),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || "Failed to send WhatsApp message.");
  }
  return json;
}

/**
 * Format and send a Financial Alert
 */
export async function sendFinancialAlert({ type, title, amount, category, number }) {
  const icons = {
    budget: "⚠️ *BUDGET ALERT*",
    goal: "🎯 *GOAL UPDATE*",
    bill: "📅 *BILL REMINDER*",
    transaction: "💳 *TRANSACTION RECORDED*",
    summary: "📊 *FINANCIAL SUMMARY*",
  };

  const header = icons[type] || "🔔 *OPUS NOTIFICATION*";
  const lines = [
    `${header} — OPUS by octtapus`,
    "",
    title,
  ];

  if (amount) lines.push(`*Amount:* ${amount}`);
  if (category) lines.push(`*Category:* ${category}`);
  lines.push("", "Check your dashboard for full details: https://opus-finance-sigma.vercel.app");

  return sendWhatsAppMessage({
    number,
    text: lines.join("\n"),
  });
}
